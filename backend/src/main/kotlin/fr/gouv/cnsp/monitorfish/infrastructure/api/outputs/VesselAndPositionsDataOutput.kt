package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselInformation

data class VesselAndPositionsDataOutput(
    val positions: List<PositionDataOutput>,
    val vessel: VesselDataOutput?,
) {
    companion object {
        fun fromVesselWithData(vesselInformation: VesselInformation): VesselAndPositionsDataOutput {
            return VesselAndPositionsDataOutput(
                vessel = VesselDataOutput.fromVesselAndRiskFactor(
                    vesselInformation.vessel,
                    vesselInformation.vesselRiskFactor,
                ),
                positions = vesselInformation.positions.map {
                    PositionDataOutput.fromPosition(it)
                },
            )
        }
    }
}
