import { applyDecorators } from '@nestjs/common';
import {
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

/**
 * Common API response decorators for Swagger documentation
 */

export function ApiAuthResponses() {
  return applyDecorators(
    ApiUnauthorizedResponse({ description: 'Access token not provided or invalid' }),
    ApiForbiddenResponse({ description: 'Insufficient role permissions' }),
  );
}

export function ApiCrudResponses(entity: string) {
  return applyDecorators(
    ApiNotFoundResponse({ description: `${entity} not found` }),
    ApiBadRequestResponse({ description: 'Validation error or bad request data' }),
    ApiUnauthorizedResponse({ description: 'Access token not provided or invalid' }),
    ApiForbiddenResponse({ description: 'Insufficient role permissions' }),
  );
}

export function ApiCreatedResponse201(description: string) {
  return ApiResponse({ status: 201, description });
}

export function ApiOkResponse200(description: string) {
  return ApiResponse({ status: 200, description });
}
