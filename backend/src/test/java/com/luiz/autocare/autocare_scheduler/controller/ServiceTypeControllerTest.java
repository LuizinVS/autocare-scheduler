package com.luiz.autocare.autocare_scheduler.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luiz.autocare.autocare_scheduler.dto.ServiceTypeResponseDTO;
import com.luiz.autocare.autocare_scheduler.handler.GlobalExceptionHandler;
import com.luiz.autocare.autocare_scheduler.model.ServicePrice;
import com.luiz.autocare.autocare_scheduler.model.ServiceType;
import com.luiz.autocare.autocare_scheduler.model.VehicleSize;
import com.luiz.autocare.autocare_scheduler.service.ServiceTypeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ServiceTypeControllerTest {

    private final ServiceTypeService service = mock(ServiceTypeService.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ServiceTypeController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    @Test
    void listIncludesNestedPrices() throws Exception {
        ServiceType serviceType = new ServiceType();
        serviceType.setId(1L);
        serviceType.setName("Lavagem");
        ServicePrice price = new ServicePrice();
        price.setVehicleSize(VehicleSize.PEQUENO);
        price.setPrice(30.0);
        when(service.findAll(any())).thenReturn(
                new PageImpl<>(List.of(new ServiceTypeResponseDTO(serviceType, List.of(price)))));

        var response = new ServiceTypeController(service).findAll(Pageable.unpaged());

        assertEquals(200, response.getStatusCode().value());
        ServiceTypeResponseDTO body = response.getBody().getContent().get(0);
        assertEquals("Lavagem", body.getName());
        assertEquals(VehicleSize.PEQUENO, body.getPrices().get(0).getVehicleSize());
        assertEquals(30.0, body.getPrices().get(0).getPrice());
    }

    @Test
    void createAndDeleteEndpointsDoNotExist() throws Exception {
        mockMvc.perform(post("/service-types")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(delete("/service-types/1"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void updatePriceOnlyUpdatesExistingCombination() throws Exception {
        ServicePrice updated = new ServicePrice();
        updated.setVehicleSize(VehicleSize.MEDIO);
        updated.setPrice(45.0);
        when(service.updatePrice(eq(1L), eq(VehicleSize.MEDIO), any())).thenReturn(updated);

        mockMvc.perform(put("/service-types/1/prices/MEDIO")
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(java.util.Map.of("price", 45.0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicleSize").value("MEDIO"))
                .andExpect(jsonPath("$.price").value(45.0));

        verify(service).updatePrice(eq(1L), eq(VehicleSize.MEDIO), any());
    }
}
