package com.reusecircle.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import com.reusecircle.entity.*;

@Data
public class RequestStatusInput {
    @NotNull
    private RequestStatus status;
}
