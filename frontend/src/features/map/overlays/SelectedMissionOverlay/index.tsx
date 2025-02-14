import GeoJSON from 'ol/format/GeoJSON'
import { useMemo } from 'react'

import { OPENLAYERS_PROJECTION } from '../../../../domain/entities/map/constants'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { MissionOverlay } from '../MissionOverlay'

export function SelectedMissionOverlay({ map }) {
  const selectedMissionGeoJSON = useMainAppSelector(store => store.mission.selectedMissionGeoJSON)
  const isMissionsLayerDisplayed = useMainAppSelector(store => store.displayedComponent.isMissionsLayerDisplayed)

  const selectedMission = useMemo(() => {
    if (!selectedMissionGeoJSON || !isMissionsLayerDisplayed) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(selectedMissionGeoJSON)
  }, [selectedMissionGeoJSON, isMissionsLayerDisplayed])

  return <MissionOverlay feature={selectedMission} isSelected map={map} />
}
