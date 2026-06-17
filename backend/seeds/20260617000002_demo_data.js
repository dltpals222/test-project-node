const bcrypt = require('bcrypt');

/**
 * 데모 데이터 시드 (그럴듯한 대시보드용).
 * - records 가 이미 있으면 건너뜀(idempotent).
 * - 데모 계정(manager1 / member1)은 password_changed_at 을 채워 바로 로그인 가능.
 * - 일부 리드를 담당자/협력사 파트너에 배정해 배정 기반 RBAC 가 시각적으로 드러나게 함.
 */
exports.seed = async (knex) => {
  const count = await knex('records').count('* as c').first();
  if (count && Number(count.c) > 0) return;

  const ensureUser = async (username, role, plain) => {
    const existing = await knex('users').where({ username }).first();
    if (existing) return existing;
    const [created] = await knex('users')
      .insert({
        username,
        role,
        status: 'active',
        password_hash: await bcrypt.hash(plain, 10),
        password_changed_at: knex.fn.now(), // 데모 계정은 강제 변경 없이 바로 로그인
      })
      .returning('*');
    return created;
  };

  const ensurePartner = async (userId, type, name) => {
    const existing = await knex('partners').where({ user_id: userId }).first();
    if (existing) return existing;
    const [created] = await knex('partners')
      .insert({ user_id: userId, partner_type: type, name })
      .returning('*');
    return created;
  };

  // 바로 로그인 가능한 데모 관리자 (superadmin 은 문서대로 force-change 유지)
  await ensureUser('admin1', 'admin', 'Admin1!');
  const manager = await ensureUser('manager1', 'manager', 'Manager1!');
  const member = await ensureUser('member1', 'member', 'Member1!');
  const mgrPartner = await ensurePartner(manager.id, 'internal', '김담당');
  const memPartner = await ensurePartner(member.id, 'external', '베스트파트너스');

  const names = [
    '홍길동', '김서연', '이준호', '박지민', '최유진', '정민수',
    '강하늘', '윤서아', '임도현', '한지우', '오세훈', '신예은',
    '권태양', '배수지', '문가영', '조현우', '장미래', '서지호',
  ];
  const statuses = [
    'new', 'new', 'new', 'assigned', 'assigned', 'in_progress',
    'in_progress', 'in_progress', 'completed', 'completed', 'completed', 'completed',
    'cancelled', 'new', 'assigned', 'in_progress', 'completed', 'new',
  ];

  const rows = names.map((name, i) => {
    const status = statuses[i];
    const active = ['assigned', 'in_progress', 'completed'].includes(status);
    return {
      name,
      phone: `010-${String(1000 + i).padStart(4, '0')}-${String(3000 + i * 13).padStart(4, '0')}`,
      status,
      assigned_at: active ? knex.fn.now() : null,
      completed_at: status === 'completed' ? knex.fn.now() : null,
    };
  });

  const inserted = await knex('records').insert(rows).returning(['id', 'status']);

  const assignable = inserted.filter((r) =>
    ['assigned', 'in_progress', 'completed'].includes(r.status),
  );
  const assignments = assignable.map((r, i) => ({
    record_id: r.id,
    partner_id: i % 2 === 0 ? mgrPartner.id : memPartner.id,
    assigned_by: 1, // superadmin
    status: 'assigned',
  }));
  if (assignments.length) {
    await knex('record_assignments').insert(assignments);
  }
};
