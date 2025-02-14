import { memo } from 'react'
import styled from 'styled-components'

import { AirControlForm } from './AirControlForm'
import { AirSurveillanceForm } from './AirSurveillanceForm'
import { LandControlForm } from './LandControlForm'
import { ObservationForm } from './ObservationForm'
import { SeaControlForm } from './SeaControlForm'
import { MissionAction } from '../../../../domain/types/missionAction'
import { FrontendErrorBoundary } from '../../../../ui/FrontendErrorBoundary'

import type { FormikFormError } from '../../../../types'
import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

type ActionFormProps = {
  actionFormValues: MissionActionFormValues | undefined
  onChange: (nextActionFormValues: MissionActionFormValues) => Promisable<void>
  onError: (nextFormError: FormikFormError) => Promisable<void>
}
function UnmemoizedActionForm({ actionFormValues, onChange, onError }: ActionFormProps) {
  if (!actionFormValues) {
    return <Wrapper />
  }

  return (
    <Wrapper>
      <FrontendErrorBoundary>
        {actionFormValues.actionType === MissionAction.MissionActionType.AIR_CONTROL && (
          <AirControlForm initialValues={actionFormValues} onChange={onChange} onError={onError} />
        )}
        {actionFormValues.actionType === MissionAction.MissionActionType.AIR_SURVEILLANCE && (
          <AirSurveillanceForm initialValues={actionFormValues} onChange={onChange} onError={onError} />
        )}
        {actionFormValues.actionType === MissionAction.MissionActionType.LAND_CONTROL && (
          <LandControlForm initialValues={actionFormValues} onChange={onChange} onError={onError} />
        )}
        {actionFormValues.actionType === MissionAction.MissionActionType.OBSERVATION && (
          <ObservationForm initialValues={actionFormValues} onChange={onChange} onError={onError} />
        )}
        {actionFormValues.actionType === MissionAction.MissionActionType.SEA_CONTROL && (
          <SeaControlForm initialValues={actionFormValues} onChange={onChange} onError={onError} />
        )}
      </FrontendErrorBoundary>
    </Wrapper>
  )
}

/**
 * @description
 * This component is fully memoized because we want its parent (`<MissionForm />`) to fully control
 * when to re-create this component using a `key` prop,
 * which should only happens when the user switches from one mission action to another.
 */
export const ActionForm = memo(UnmemoizedActionForm, () => true)

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-direction: column;
  max-width: 33.33%;
  min-width: 33.33%;
  overflow-y: auto;
`
