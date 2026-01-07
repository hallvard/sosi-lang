import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { SosiAstType, Namespace } from './generated/ast.js';
import type { SosiServices } from './sosi-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SosiServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SosiValidator;
    const checks: ValidationChecks<SosiAstType> = {
        Specification: validator.checkSpecificationHasTypes
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SosiValidator {

    checkSpecificationHasTypes(ns: Namespace, accept: ValidationAcceptor): void {
        if (ns.types.length === 0) {
            accept('warning', 'A Namespace (package or specification) should have some types.', { node: ns, property: 'types' });
        }
    }
}
