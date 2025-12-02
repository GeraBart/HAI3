/**
 * ESLint Local Plugin
 * Custom rules for HAI3 screenset architecture enforcement
 */

import noBarrelExportsEventsEffects = require('./rules/no-barrel-exports-events-effects');
import noCoordinatorEffects = require('./rules/no-coordinator-effects');
import noMissingDomainId = require('./rules/no-missing-domain-id');
import domainEventFormat = require('./rules/domain-event-format');

export = {
  rules: {
    'no-barrel-exports-events-effects': noBarrelExportsEventsEffects,
    'no-coordinator-effects': noCoordinatorEffects,
    'no-missing-domain-id': noMissingDomainId,
    'domain-event-format': domainEventFormat,
  },
};
