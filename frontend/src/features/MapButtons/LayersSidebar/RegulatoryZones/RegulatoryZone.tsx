// TODO Remove temporary `as any` and `@ts-ignore` (fresh migration to TS).

import { memo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import {
  addRegulatoryTopicOpened,
  closeRegulatoryZoneMetadataPanel,
  removeRegulatoryTopicOpened
} from '../../../../domain/shared_slices/Regulatory'
import hideLayer from '../../../../domain/use_cases/layer/hideLayer'
import { closeRegulatoryZoneMetadata } from '../../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import showRegulationToEdit from '../../../../domain/use_cases/layer/regulation/showRegulationToEdit'
import showRegulatoryZone from '../../../../domain/use_cases/layer/regulation/showRegulatoryZone'
import { showRegulatoryZoneMetadata } from '../../../../domain/use_cases/layer/regulation/showRegulatoryZoneMetadata'
import zoomInLayer from '../../../../domain/use_cases/layer/zoomInLayer'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { theme } from '../../../../ui/theme'
import { CloseIcon } from '../../../commonStyles/icons/CloseIcon.style'
import { EditIcon } from '../../../commonStyles/icons/EditIcon.style'
import { HideIcon } from '../../../commonStyles/icons/HideIcon.style'
import { PaperDarkIcon, PaperIcon } from '../../../commonStyles/icons/REGPaperIcon.style'
import { ShowIcon } from '../../../commonStyles/icons/ShowIcon.style'
import { getRegulatoryLayerStyle } from '../../../map/layers/styles/regulatoryLayer.style'

export function showOrHideMetadataIcon(regulatoryZoneMetadata, regulatoryZone, setMetadataIsShown) {
  if (
    regulatoryZoneMetadata &&
    regulatoryZone &&
    (regulatoryZone.topic !== regulatoryZoneMetadata.topic || regulatoryZone.zone !== regulatoryZoneMetadata.zone)
  ) {
    setMetadataIsShown(false)
  } else if (
    regulatoryZoneMetadata &&
    regulatoryZone &&
    regulatoryZone.topic === regulatoryZoneMetadata.topic &&
    regulatoryZone.zone === regulatoryZoneMetadata.zone
  ) {
    setMetadataIsShown(true)
  } else if (!regulatoryZoneMetadata && regulatoryZone) {
    setMetadataIsShown(false)
  }
}

// TODO Properly type all these `any`.
export type RegulatoryZoneProps = {
  allowRemoveZone: any
  callRemoveRegulatoryZoneFromMySelection: any
  isEditable: any
  isLast: any
  namespace: any
  regulatoryTopic: any
  regulatoryZone: any
}
function UnmemoizedRegulatoryZone({
  allowRemoveZone,
  callRemoveRegulatoryZoneFromMySelection,
  isEditable,
  isLast,
  namespace,
  regulatoryTopic,
  regulatoryZone
}: RegulatoryZoneProps) {
  const dispatch = useMainAppDispatch()
  const navigate = useNavigate()

  const { isReadyToShowRegulatoryLayers, regulatoryZoneMetadata } = useMainAppSelector(state => state.regulatory)
  const zoneIsShown = useMainAppSelector(state =>
    state.layer.showedLayers.some(layer => (layer as any).id === regulatoryZone?.id)
  )

  const [metadataIsShown, setMetadataIsShown] = useState(false)
  const [isOver, setIsOver] = useState(false)
  const vectorLayerStyle = getRegulatoryLayerStyle(undefined, regulatoryZone)

  const callShowRegulatoryZoneMetadata = zone => {
    if (!metadataIsShown) {
      dispatch((showRegulatoryZoneMetadata as any)(zone))
      setMetadataIsShown(true)
    } else {
      dispatch(closeRegulatoryZoneMetadata())
      setMetadataIsShown(false)
    }
  }

  useEffect(() => {
    showOrHideMetadataIcon(regulatoryZoneMetadata, regulatoryZone, setMetadataIsShown)
  }, [regulatoryZoneMetadata, regulatoryZone])

  const triggerShowRegulatoryZone = () => {
    if (!zoneIsShown && isReadyToShowRegulatoryLayers) {
      dispatch(
        showRegulatoryZone({
          type: LayerProperties.REGULATORY.code,
          ...regulatoryZone,
          namespace
        })
      )
    } else {
      dispatch(
        hideLayer({
          type: LayerProperties.REGULATORY.code,
          ...regulatoryZone,
          namespace
        })
      )
    }
  }

  const onEditRegulationClick = () => {
    dispatch(showRegulationToEdit(regulatoryZone))
    dispatch(removeRegulatoryTopicOpened(regulatoryTopic))
    dispatch(addRegulatoryTopicOpened(regulatoryTopic))
    dispatch(closeRegulatoryZoneMetadataPanel())

    navigate('/backoffice/regulation/edit')
  }

  const onMouseEnter = () => !isOver && setIsOver(true)
  const onMouseLeave = () => isOver && setIsOver(false)

  return (
    <Zone
      data-cy="regulatory-layer-zone"
      // @ts-ignore
      isLast={isLast}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Rectangle
        onClick={() => dispatch(zoomInLayer({ topicAndZone: regulatoryZone }))}
        // @ts-ignore
        vectorLayerStyle={vectorLayerStyle}
      />
      <ZoneText
        data-cy="regulatory-layers-my-zones-zone"
        onClick={triggerShowRegulatoryZone}
        title={regulatoryZone.zone ? regulatoryZone.zone : 'AUCUN NOM'}
      >
        {regulatoryZone.zone ? regulatoryZone.zone : 'AUCUN NOM'}
      </ZoneText>
      <Icons>
        {isEditable && (
          <EditIcon
            // @ts-ignore
            $isOver={isOver}
            data-cy="regulatory-layer-zone-edit"
            onClick={onEditRegulationClick}
            title="Editer la réglementation"
          />
        )}
        {metadataIsShown ? (
          <PaperDarkIcon
            onClick={() => callShowRegulatoryZoneMetadata(regulatoryZone)}
            title="Fermer la réglementation"
          />
        ) : (
          <PaperIcon
            data-cy="regulatory-layers-show-metadata"
            onClick={() => callShowRegulatoryZoneMetadata(regulatoryZone)}
            title="Afficher la réglementation"
          />
        )}
        {zoneIsShown ? (
          <ShowIcon
            data-cy="regulatory-layers-my-zones-zone-hide"
            onClick={triggerShowRegulatoryZone}
            // @ts-ignore
            title="Cacher la zone"
          />
        ) : (
          <HideIcon
            data-cy="regulatory-layers-my-zones-zone-show"
            onClick={triggerShowRegulatoryZone}
            // @ts-ignore
            title="Afficher la zone"
          />
        )}
        {allowRemoveZone ? (
          <CloseIcon
            data-cy="regulatory-layers-my-zones-zone-delete"
            onClick={() => callRemoveRegulatoryZoneFromMySelection(regulatoryZone, 1, namespace)}
            title="Supprimer la zone de ma sélection"
          />
        ) : null}
      </Icons>
    </Zone>
  )
}

// TODO Remove this `any`.
const Rectangle = styled.div<any>`
  width: 14px;
  height: 14px;
  background: ${props =>
    props.vectorLayerStyle && props.vectorLayerStyle.getFill()
      ? props.vectorLayerStyle.getFill().getColor()
      : props.theme.color.lightGray};
  border: 1px solid
    ${props =>
      props.vectorLayerStyle && props.vectorLayerStyle.getStroke()
        ? props.vectorLayerStyle.getStroke().getColor()
        : props.theme.color.slateGray};
  display: inline-block;
  margin-right: 10px;
  margin-left: 2px;
  margin-top: 7px;
  cursor: zoom-in;
`

const Icons = styled.span`
  float: right;
  display: flex;
  justify-content: flex-end;
  flex: 1;
`

const Zone = styled.span<{
  isLast: boolean
}>`
  display: flex;
  justify-content: flex-start;
  line-height: 1.9em;
  padding-left: 31px;
  padding-top: 4px;
  padding-bottom: 4px;
  user-select: none;
  font-size: 13px;
  font-weight: 300;
  ${props => (props.isLast ? `border-bottom: 1px solid ${COLORS.lightGray}; height: 27px;` : 'height: 28px;')}

  :hover {
    background: ${theme.color.blueGray['25']};
  }
`

const ZoneText = styled.span`
  width: 63%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  vertical-align: bottom;
  padding-bottom: 3px;
  padding-left: 0;
  margin-top: 5px;
`

export const RegulatoryZone = memo(UnmemoizedRegulatoryZone)
