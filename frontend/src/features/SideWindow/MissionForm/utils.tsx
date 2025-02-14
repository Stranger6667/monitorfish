import { customDayjs, type Undefine } from '@mtes-mct/monitor-ui'
import { difference } from 'lodash'
import { omit } from 'ramda'

import { AirControlFormSchema, LandControlFormSchema, SeaControlFormSchema } from './ActionForm/schemas'
import { INITIAL_MISSION_CONTROL_UNIT, MISSION_ACTION_FORM_VALUES_SKELETON } from './constants'
import { MainFormSchema } from './MainForm/schemas'
import { Mission } from '../../../domain/entities/mission/types'
import { MissionAction } from '../../../domain/types/missionAction'
import { FormError, FormErrorCode } from '../../../libs/FormError'
import { FrontendError } from '../../../libs/FrontendError'
import { validateRequiredFormValues } from '../../../utils/validateRequiredFormValues'

import type { MissionActionFormValues, MissionMainFormValues } from './types'
import type { ControlUnit } from '../../../domain/types/controlUnit'

import MissionActionType = MissionAction.MissionActionType

export function areMissionFormValuesValid(
  mainFormValues: MissionMainFormValues | undefined,
  actionsFormValues: MissionActionFormValues[]
): boolean {
  if (!mainFormValues) {
    return false
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const actionFormValues of actionsFormValues) {
    switch (actionFormValues.actionType) {
      case MissionAction.MissionActionType.AIR_CONTROL:
        if (!AirControlFormSchema.isValidSync(actionFormValues)) {
          return false
        }
        break

      case MissionAction.MissionActionType.LAND_CONTROL:
        if (!LandControlFormSchema.isValidSync(actionFormValues)) {
          return false
        }
        break

      case MissionAction.MissionActionType.SEA_CONTROL:
        if (!SeaControlFormSchema.isValidSync(actionFormValues)) {
          return false
        }
        break

      default:
        break
    }
  }

  return MainFormSchema.isValidSync(mainFormValues)
}

/**
 *
 * @param missionId
 * @param missionActionsFormValues
 * @param originalMissionActions Mission actions as they were previous to the mission edition
 */
export function getMissionActionsDataFromMissionActionsFormValues(
  missionId: MissionAction.MissionAction['missionId'],
  missionActionsFormValues: MissionActionFormValues[],
  originalMissionActions: MissionAction.MissionAction[] = []
): {
  deletedMissionActionIds: number[]
  updatedMissionActionDatas: MissionAction.MissionActionData[]
} {
  const updatedMissionActionDatas = missionActionsFormValues.map(missionActionFormValues => {
    const missionActionFormValuesWithAllProps = {
      ...MISSION_ACTION_FORM_VALUES_SKELETON,
      ...missionActionFormValues
    }

    const maybeValidMissionActionData = omit(['isDraft', 'isVesselUnknown'], missionActionFormValuesWithAllProps)
    const validMissionActionData = getValidMissionActionData(maybeValidMissionActionData)

    return {
      ...validMissionActionData,
      missionId
    }
  })

  const originalMissionActionIds = originalMissionActions.map(({ id }) => id as number)
  const updatedMissionActionIds = updatedMissionActionDatas
    .filter(({ id }) => typeof id === 'number')
    .map(({ id }) => id as number)
  const deletedMissionActionIds = difference(originalMissionActionIds, updatedMissionActionIds)

  return {
    deletedMissionActionIds,
    updatedMissionActionDatas
  }
}

/**
 * @param mustClose Should the mission be closed?
 */
export function getMissionDataFromMissionFormValues(
  mainFormValues: MissionMainFormValues,
  mustClose: boolean = false
): Mission.MissionData {
  if (!mainFormValues.startDateTimeUtc) {
    throw new FormError(mainFormValues, 'startDateTimeUtc', FormErrorCode.MISSING_OR_UNDEFINED)
  }

  const missionBaseValues = omit(['controlUnits'], mainFormValues)

  const validControlUnits = mainFormValues.controlUnits.map(getValidMissionDataControlUnit)
  const missionSource = Mission.MissionSource.MONITORFISH
  const missionTypes = mainFormValues.missionTypes || []

  return {
    ...missionBaseValues,
    controlUnits: validControlUnits,
    isClosed: mustClose || !!missionBaseValues.isClosed,
    missionSource,
    missionTypes
  }
}

export function getMissionFormInitialValues(
  mission: Mission.Mission | undefined,
  missionActions: MissionAction.MissionAction[]
): {
  initialActionsFormValues: MissionActionFormValues[]
  initialMainFormValues: MissionMainFormValues
} {
  if (!mission) {
    const startDateTimeUtc = customDayjs().startOf('minute').toISOString()

    return {
      initialActionsFormValues: [],
      initialMainFormValues: {
        controlUnits: [INITIAL_MISSION_CONTROL_UNIT],
        missionTypes: [Mission.MissionType.SEA],
        startDateTimeUtc
      }
    }
  }

  const missionType = mission.missionTypes[0]
  if (!missionType) {
    throw new FrontendError('`missionType` is undefined.')
  }

  return {
    initialActionsFormValues: missionActions,
    initialMainFormValues: mission
  }
}

export function getTitleFromMissionMainFormValues(
  mainFormValues: MissionMainFormValues | undefined,
  missionId: number | undefined
): string {
  if (!mainFormValues) {
    return 'Mission en cours de chargement...'
  }

  return missionId
    ? `Mission ${
        mainFormValues.missionTypes &&
        mainFormValues.missionTypes.map(missionType => Mission.MissionTypeLabel[missionType]).join(' / ')
      } – ${mainFormValues.controlUnits.map(controlUnit => controlUnit.name?.replace('(historique)', '')).join(', ')}`
    : `Nouvelle mission`
}

/**
 * @param mustClose Should the mission be closed?
 */
export function getUpdatedMissionFromMissionMainFormValues(
  missionId: Mission.Mission['id'],
  mainFormValues: MissionMainFormValues,
  mustClose: boolean
): Mission.Mission {
  const missionData = getMissionDataFromMissionFormValues(mainFormValues, mustClose)

  return {
    id: missionId,
    ...missionData
  }
}

export function isValidControlUnit(
  controlUnitFormValues: ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft
): controlUnitFormValues is ControlUnit.ControlUnit {
  const [, error] = validateRequiredFormValues(
    ['administration', 'id', 'isArchived', 'name', 'resources'],
    controlUnitFormValues as ControlUnit.ControlUnit
  )

  return !error
}

export function getValidMissionActionData(
  maybeValidMissionActionData: Omit<Undefine<MissionActionFormValues>, 'isDraft'>
): Omit<MissionAction.MissionActionData, 'missionId'> {
  if (
    maybeValidMissionActionData?.actionType === MissionActionType.AIR_CONTROL ||
    maybeValidMissionActionData?.actionType === MissionActionType.LAND_CONTROL ||
    maybeValidMissionActionData?.actionType === MissionActionType.SEA_CONTROL
  ) {
    const [validMissionActionData, formError] = validateRequiredFormValues(
      ['actionDatetimeUtc', 'actionType', 'vesselId', 'vesselName'],
      maybeValidMissionActionData
    )

    if (formError) {
      throw formError
    }

    return validMissionActionData
  }

  const [validMissionActionData, formError] = validateRequiredFormValues(
    ['actionDatetimeUtc', 'actionType'],
    maybeValidMissionActionData
  )

  if (formError) {
    throw formError
  }

  return validMissionActionData
}

export function getValidMissionDataControlUnit(
  maybeValidMissionDataControlUnit: ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft
): Mission.MissionData['controlUnits'][0] {
  const [validMissionDataControlUnit, formError] = validateRequiredFormValues(
    ['administration', 'id', 'isArchived', 'name', 'resources'],
    maybeValidMissionDataControlUnit as ControlUnit.ControlUnit
  )
  if (formError) {
    throw formError
  }

  return validMissionDataControlUnit
}
