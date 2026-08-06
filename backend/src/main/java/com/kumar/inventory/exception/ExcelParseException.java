package com.kumar.inventory.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ExcelParseException extends RuntimeException {
    public ExcelParseException(String message) {
        super(message);
    }
    public ExcelParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
