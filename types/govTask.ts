/**
 * Governance Task Contract — 1:1 mapping of .gov/tasks/*.yaml schema.
 *
 * This file defines the typed contract for governance task YAML files.
 * It is NOT a redesign or abstraction — it mirrors the exact structure
 * present in /opt/bizmate-alpha/.gov/tasks/alpha/*.yaml.
 */

// ============================================================================
// ENUMS
// ============================================================================

/** Task lifecycle status as stored in YAML */
export type GovTaskStatus = 'pending' | 'in_progress' | 'validated' | 'failed';

/** Phase identifier */
export type GovPhase = 'alpha' | 'beta' | 'full';

/** Task group within a phase */
export type GovGroup =
  | 'phase-1-foundation'
  | 'phase-2-backend-core'
  | 'phase-3-ai-subsystem'
  | 'phase-4-frontend'
  | 'phase-5-validation';

/** File extraction action */
export type ExtractionAction = 'copy-as-is' | 'copy-and-trim' | 'resolve' | 'create-empty' | 'vendor';

/** Whether filename resolution is required before execution */
export type FilenameResolution = 'required' | 'not-required';

// ============================================================================
// EXTRACTION SPEC
// ============================================================================

/** A single file entry in the extraction manifest */
export interface GovExtractionFile {
  readonly source: string;
  readonly target: string;
  readonly action: ExtractionAction;
}

/** Full extraction specification — null for gate-only or non-extraction tasks */
export interface GovExtractionSpec {
  readonly source_base: string;
  readonly target_base: string;
  readonly files: readonly GovExtractionFile[];
  readonly filename_resolution: FilenameResolution;

  /** Present only for 'resolve' action tasks */
  readonly resolve_method?: string;

  /** Directories to create before extraction (may be absent) */
  readonly directories_to_create?: readonly string[];
}

// ============================================================================
// TRIM SPEC
// ============================================================================

/**
 * Trim instructions per file. Keys are relative file paths,
 * values are ordered arrays of human-readable trim directives.
 * null when no trimming is needed.
 */
export type GovTrimSpec = Readonly<Record<string, readonly string[]>> | null;

// ============================================================================
// VALIDATION SPEC
// ============================================================================

/**
 * A single validation check. Fields vary by check type.
 * All checks have `type` and `description`.
 * Additional fields depend on the check type.
 */
export interface GovValidationCheck {
  readonly type: string;
  readonly description: string;

  /** For files-exist checks */
  readonly expected_count?: number;

  /** For syntax-check: shell command with {file} placeholder */
  readonly command_template?: string;

  /** For checks with an explicit command (no placeholder) */
  readonly command?: string;

  /** For grep-based checks */
  readonly grep_pattern?: string;
  readonly expect?: string;

  /** For grep scoped to a specific path */
  readonly path?: string;

  /** For grep scoped to a specific file */
  readonly file?: string;

  /** For directory-exists checks */
  readonly paths?: readonly string[];

  /** For gate leakage checks — routes that must 404 */
  readonly routes_404?: readonly string[];

  /** For gate leakage checks — pages that must not exist */
  readonly pages_absent?: readonly string[];

  /** For gate checks — route arrays to verify */
  readonly routes?: readonly string[];

  /** For golden-path steps — nested sub-checks */
  readonly checks?: readonly string[];
}

/** Full validation specification */
export interface GovValidationSpec {
  readonly checks: readonly GovValidationCheck[];

  /** Present on gate tasks */
  readonly type?: 'gate';
  readonly gate_id?: string;
  readonly minimum_authority_level?: number;
  readonly gate_output?: string;
  readonly verdict_criteria?: string;
}

// ============================================================================
// AUTHORIZATION SPEC
// ============================================================================

/** Authorization requirements for a task */
export interface GovAuthorizationSpec {
  readonly rules_required: readonly string[];
  readonly minimum_authority_level: number;
}

// ============================================================================
// GOV TASK (complete schema)
// ============================================================================

/** Complete governance task — 1:1 mapping of a .gov/tasks/{phase}/{id}.yaml file */
export interface GovTask {
  readonly schema_version: number;
  readonly task_id: string;
  readonly phase: GovPhase;
  readonly group: GovGroup;

  readonly name: string;
  readonly description: string;

  readonly status: GovTaskStatus;
  readonly assigned_to: string | null;
  readonly started_at: string | null;
  readonly completed_at: string | null;
  readonly validated_at: string | null;

  readonly blocked_by: readonly string[];
  readonly blocks: readonly string[];

  /** null for gate-only tasks or tasks with no file extraction */
  readonly extraction: GovExtractionSpec | null;

  /** null when no trimming is required */
  readonly trim: GovTrimSpec;

  readonly validation: GovValidationSpec;
  readonly authorization: GovAuthorizationSpec;
}
