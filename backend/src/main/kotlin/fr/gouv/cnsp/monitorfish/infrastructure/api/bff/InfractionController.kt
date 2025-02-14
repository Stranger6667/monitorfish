package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.infraction.GetFishingAndSecurityInfractions
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.InfractionDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/bff/v1/infractions")
@Tag(name = "APIs for Infractions")
class InfractionController(private val getFishingAndSecurityInfractions: GetFishingAndSecurityInfractions) {

    @GetMapping("")
    @Operation(summary = "Get fishing and security infractions")
    fun getFishingAndSecurityInfractions(): List<InfractionDataOutput> {
        return getFishingAndSecurityInfractions.execute().map { infraction ->
            InfractionDataOutput.fromInfraction(infraction)
        }
    }
}
