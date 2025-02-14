package fr.gouv.cnsp.monitorfish.domain.use_cases.faoAreas

import com.nhaarman.mockitokotlin2.*
import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.Species
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.repositories.RiskFactorsRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.ComputeFAOAreasFromCoordinates
import fr.gouv.cnsp.monitorfish.domain.use_cases.fao_areas.ComputeVesselFAOAreas
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.*

@ExtendWith(SpringExtension::class)
class ComputeVesselFAOAreasUTests {

    @MockBean
    private lateinit var riskFactorsRepository: RiskFactorsRepository

    @MockBean
    private lateinit var computeFAOAreasFromCoordinates: ComputeFAOAreasFromCoordinates

    @Test
    fun `execute Should return the computed fao areas When no internal reference number is given`() {
        given(computeFAOAreasFromCoordinates.execute(any(), any())).willReturn(
            listOf(
                FAOArea("27.8.c"),
                FAOArea("27.8"),
            ),
        )

        // When
        val faoAreas = ComputeVesselFAOAreas(riskFactorsRepository, computeFAOAreasFromCoordinates)
            .execute(null, 12.5, 45.1)

        // Then
        assertThat(faoAreas).isEqualTo(listOf("27.8.c", "27.8"))
    }

    @Test
    fun `execute Should return no fao area When a coordinate parameter is null`() {
        // When
        val faoAreas = ComputeVesselFAOAreas(riskFactorsRepository, computeFAOAreasFromCoordinates)
            .execute(null, null, 45.1)

        // Then
        assertThat(faoAreas).isEmpty()
    }

    @Test
    fun `execute Should return the computed fao areas When no fao areas are found in the risk factors table`() {
        given(riskFactorsRepository.findVesselRiskFactors(any()))
            .willReturn(VesselRiskFactor(speciesOnboard = listOf(Species(faoZone = null))))
        given(computeFAOAreasFromCoordinates.execute(any(), any())).willReturn(
            listOf(
                FAOArea("27.8.c"),
                FAOArea("27.8"),
            ),
        )

        // When
        val faoAreas = ComputeVesselFAOAreas(riskFactorsRepository, computeFAOAreasFromCoordinates)
            .execute("DUMMY_CFR", 12.5, 45.1)

        // Then
        assertThat(faoAreas).isEqualTo(listOf("27.8.c", "27.8"))
    }

    @Test
    fun `execute Should return the computed fao areas When no risk factor is found in the table`() {
        given(riskFactorsRepository.findVesselRiskFactors(any()))
            .willReturn(null)
        given(computeFAOAreasFromCoordinates.execute(any(), any())).willReturn(
            listOf(
                FAOArea("27.8.c"),
                FAOArea("27.8"),
            ),
        )

        // When
        val faoAreas = ComputeVesselFAOAreas(riskFactorsRepository, computeFAOAreasFromCoordinates)
            .execute("DUMMY_CFR", 12.5, 45.1)

        // Then
        assertThat(faoAreas).isEqualTo(listOf("27.8.c", "27.8"))
    }

    @Test
    fun `execute Should return the fao areas found in the risk factors table`() {
        given(riskFactorsRepository.findVesselRiskFactors(any()))
            .willReturn(VesselRiskFactor(speciesOnboard = listOf(Species(faoZone = "27.8.c"))))

        // When
        val faoAreas = ComputeVesselFAOAreas(riskFactorsRepository, computeFAOAreasFromCoordinates)
            .execute("DUMMY_CFR", 12.5, 45.1)

        // Then
        assertThat(faoAreas).isEqualTo(listOf("27.8.c"))
    }
}
