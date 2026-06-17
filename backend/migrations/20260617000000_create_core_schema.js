/**
 * 핵심 + 보안 스키마 (핸드오프 명세 03 문서 기준)
 * 의존성 순서: ENUM → users → identity_verifications → records → partners
 *            → record_assignments → record_status_history → record_memos → verification_codes
 *
 * 참고: records.identity_verification_id 와 identity_verifications.record_id 는 상호 참조이므로,
 * 두 테이블을 먼저 FK 없이 만든 뒤 ALTER TABLE 로 FK 를 추가한다.
 */

exports.up = async (knex) => {
  // 1) ENUM 타입
  await knex.raw(`CREATE TYPE role AS ENUM ('superadmin', 'admin', 'manager', 'member')`);
  await knex.raw(`CREATE TYPE account_status AS ENUM ('active', 'suspended')`);
  await knex.raw(
    `CREATE TYPE record_status AS ENUM ('new', 'assigned', 'in_progress', 'completed', 'cancelled')`,
  );
  await knex.raw(`CREATE TYPE assignment_status AS ENUM ('assigned', 'removed')`);

  // 2) users — 계정/인증 핵심 (보안 컬럼 포함)
  await knex.schema.createTable('users', (t) => {
    t.bigIncrements('id').primary();
    t.string('username').notNullable().unique();
    t.string('password_hash').notNullable();
    t.specificType('role', 'role').notNullable();
    t.specificType('status', 'account_status').notNullable().defaultTo('active');
    t.integer('failed_login_attempts').notNullable().defaultTo(0); // ⭐ 로그인 잠금
    t.timestamp('locked_until').nullable(); // ⭐ 잠금 해제 시각
    t.timestamp('password_changed_at').nullable(); // ⭐ NULL = 첫 로그인 강제변경
    t.timestamp('suspended_at').nullable();
    t.timestamp('last_login_at').nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // 3) identity_verifications — 외부 본인인증 기록 (records FK 는 뒤에서 추가)
  await knex.schema.createTable('identity_verifications', (t) => {
    t.bigIncrements('id').primary();
    t.text('external_verification_id').notNullable();
    t.text('phone').notNullable();
    t.text('name').nullable();
    t.text('status').notNullable(); // 'VERIFIED' | 'FAILED' | 'CANCELLED'
    t.jsonb('raw_response').nullable();
    t.timestamp('verified_at').nullable();
    t.bigInteger('record_id').nullable(); // FK 는 records 생성 후 ALTER 로 추가
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    t.index('phone');
    t.index('external_verification_id');
    t.index('record_id');
  });

  // 4) records — 핵심 워크플로 레코드 (soft delete)
  await knex.schema.createTable('records', (t) => {
    t.bigIncrements('id').primary();
    t.string('name').notNullable();
    t.string('phone').notNullable();
    t.specificType('status', 'record_status').notNullable().defaultTo('new');
    t.bigInteger('identity_verification_id')
      .nullable()
      .references('id')
      .inTable('identity_verifications')
      .onDelete('SET NULL');
    t.timestamp('assigned_at').nullable();
    t.timestamp('completed_at').nullable();
    t.timestamptz('deleted_at').nullable(); // ⭐ soft delete
    t.bigInteger('deleted_by').nullable().references('id').inTable('users').onDelete('SET NULL'); // ⭐ 삭제 감사
    t.timestamptz('restored_at').nullable(); // ⭐ 복원
    t.bigInteger('restored_by').nullable().references('id').inTable('users').onDelete('SET NULL'); // ⭐ 복원 감사
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    t.index('phone');
    t.index('created_at');
    t.index('status');
  });

  // records ↔ identity_verifications 상호 FK 마무리
  await knex.raw(`
    ALTER TABLE identity_verifications
    ADD CONSTRAINT identity_verifications_record_id_foreign
    FOREIGN KEY (record_id) REFERENCES records (id) ON DELETE SET NULL
  `);

  // partial index (활성/보관함 조회 최적화)
  await knex.raw(
    `CREATE INDEX idx_records_active ON records (id) WHERE deleted_at IS NULL`,
  );
  await knex.raw(
    `CREATE INDEX idx_records_archive ON records (deleted_at DESC) WHERE deleted_at IS NOT NULL`,
  );

  // 5) partners — 외부/내부 당사자 (users 와 1:1)
  await knex.schema.createTable('partners', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('user_id')
      .notNullable()
      .unique()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    t.string('partner_type', 20).notNullable(); // 'external' | 'internal'
    t.string('name', 100).notNullable();
    t.string('status', 20).notNullable().defaultTo('active');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    t.index('partner_type');
    t.index('status');
    t.index('user_id');
  });

  // 6) record_assignments — 레코드 배정 (배정 기반 RBAC의 핵심)
  await knex.schema.createTable('record_assignments', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('record_id')
      .notNullable()
      .references('id')
      .inTable('records')
      .onDelete('CASCADE');
    t.bigInteger('partner_id')
      .notNullable()
      .references('id')
      .inTable('partners')
      .onDelete('CASCADE');
    t.bigInteger('assigned_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.specificType('status', 'assignment_status').notNullable().defaultTo('assigned');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('removed_at').nullable();
    t.timestamptz('deleted_at').nullable();
    t.bigInteger('deleted_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.unique(['record_id', 'partner_id']);
    t.index('record_id');
    t.index('partner_id');
  });
  await knex.raw(
    `CREATE INDEX idx_assignments_active ON record_assignments (record_id, partner_id) WHERE deleted_at IS NULL`,
  );

  // 7) record_status_history — 상태 변경 이력 (감사)
  await knex.schema.createTable('record_status_history', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('record_id')
      .notNullable()
      .references('id')
      .inTable('records')
      .onDelete('CASCADE');
    t.bigInteger('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.specificType('from_status', 'record_status').nullable();
    t.specificType('to_status', 'record_status').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index('record_id');
  });

  // 8) record_memos — 메모 (감사 updated_by)
  await knex.schema.createTable('record_memos', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('record_id')
      .notNullable()
      .references('id')
      .inTable('records')
      .onDelete('CASCADE');
    t.bigInteger('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.bigInteger('partner_id').nullable().references('id').inTable('partners');
    t.text('content').notNullable();
    t.boolean('is_important').notNullable().defaultTo(false);
    t.bigInteger('updated_by').nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    t.index('record_id');
  });

  // 9) verification_codes — OTP/인증코드 (독립, FK 없음)
  await knex.schema.createTable('verification_codes', (t) => {
    t.bigIncrements('id').primary();
    t.string('phone').nullable();
    t.string('code').nullable();
    t.boolean('is_verified').notNullable().defaultTo(false);
    t.string('ip_address', 45).nullable(); // 발급 IP (남용 추적)
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('verified_at').nullable();
    t.index('phone');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('verification_codes');
  await knex.schema.dropTableIfExists('record_memos');
  await knex.schema.dropTableIfExists('record_status_history');
  await knex.schema.dropTableIfExists('record_assignments');
  // 상호 FK 제거 후 테이블 drop
  await knex.raw(
    `ALTER TABLE IF EXISTS identity_verifications DROP CONSTRAINT IF EXISTS identity_verifications_record_id_foreign`,
  );
  await knex.schema.dropTableIfExists('partners');
  await knex.schema.dropTableIfExists('records');
  await knex.schema.dropTableIfExists('identity_verifications');
  await knex.schema.dropTableIfExists('users');

  await knex.raw('DROP TYPE IF EXISTS assignment_status');
  await knex.raw('DROP TYPE IF EXISTS record_status');
  await knex.raw('DROP TYPE IF EXISTS account_status');
  await knex.raw('DROP TYPE IF EXISTS role');
};
