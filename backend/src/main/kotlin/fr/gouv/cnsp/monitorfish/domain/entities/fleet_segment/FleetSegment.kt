package fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment

data class FleetSegment(
    val segment: String,
    val segmentName: String,
    val dirm: List<String> = listOf(),
    val gears: List<String>,
    val faoAreas: List<String>,
    val targetSpecies: List<String>,
    val bycatchSpecies: List<String> = listOf(),
    val impactRiskFactor: Double,
    val year: Int,
)
