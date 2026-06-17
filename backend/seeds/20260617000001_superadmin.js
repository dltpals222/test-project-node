const bcrypt = require('bcrypt');

/**
 * 초기 superadmin 계정 시드.
 * password_changed_at = NULL → 첫 로그인 시 비밀번호 강제 변경.
 * 초기 비밀번호: superadmin123!
 */
exports.seed = async (knex) => {
  const exists = await knex('users').where({ username: 'superadmin' }).first();
  if (exists) return;

  await knex('users').insert({
    username: 'superadmin',
    password_hash: await bcrypt.hash('superadmin123!', 10),
    role: 'superadmin',
    status: 'active',
    password_changed_at: null, // 첫 로그인 시 강제 변경
  });
};
