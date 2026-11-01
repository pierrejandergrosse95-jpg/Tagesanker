import type { MoonInfo, PrincipalPhase } from '../../core/astro/moon';
import { PHASE_NAMES } from '../../core/astro/moon';
import { t } from '../../i18n';

/** Mondphasen-Namen in der aktuellen Sprache. */
export const moonName = (m: MoonInfo) => t(m.name);
export const phaseName = (p: PrincipalPhase) => t(PHASE_NAMES[p]);
