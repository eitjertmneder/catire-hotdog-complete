const { execSync } = require('child_process');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function log(color, msg) {
  console.log(`${color}${msg}${COLORS.reset}`);
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 10000 }).trim().replace(/'/g, '');
  } catch {
    return '';
  }
}

function checkDocker() {
  log(COLORS.bold + COLORS.cyan, '\n[1] Docker Containers');
  log(COLORS.gray, '----------------------------------------');
  const ps = run('docker ps --format "table {{.Names}}\\t{{.Status}}"');
  if (ps) console.log(ps);
  const count = run('docker ps --format "{{.Names}}"').split('\n').filter(Boolean).length;
  log(COLORS.green, `  Containers corriendo: ${count}`);
  return count;
}

function checkNginx() {
  log(COLORS.bold + COLORS.cyan, '\n[2] API Gateway (Nginx)');
  log(COLORS.gray, '----------------------------------------');
  try {
    const result = run('curl -s -o NUL -w "%{http_code}" http://localhost/health --max-time 5');
    if (result === '200') {
      log(COLORS.green, '  OK - Nginx respondiendo (Status: 200)');
      const body = run('curl -s http://localhost/health --max-time 5');
      if (body) log(COLORS.gray, `  Response: ${body}`);
    } else if (result) {
      log(COLORS.yellow, `  WARN - Nginx respondio con status: ${result} (puede necesitar restart)`);
    } else {
      log(COLORS.red, '  FALLO - Nginx no responde en puerto 80');
      log(COLORS.gray, '  Intenta: docker-compose restart api_gateway_nginx');
    }
  } catch {
    log(COLORS.red, '  FALLO - Nginx no responde en puerto 80');
    log(COLORS.gray, '  Intenta: docker-compose restart api_gateway_nginx');
  }
}

function checkServices() {
  log(COLORS.bold + COLORS.cyan, '\n[3] Microservicios');
  log(COLORS.gray, '----------------------------------------');
  const services = [
    { name: 'Auth Service', container: 'auth-service' },
    { name: 'Catalog Service', container: 'catalog-service' },
    { name: 'Order Service', container: 'order-service' },
    { name: 'Finance Config', container: 'finance-config-service' },
  ];
  for (const svc of services) {
    const status = run(`docker inspect --format='{{.State.Status}}' ${svc.container}`);
    if (status === 'running') {
      log(COLORS.green, `  OK  - ${svc.name} (${svc.container}) - running`);
    } else if (status) {
      log(COLORS.yellow, `  WARN - ${svc.name} (${svc.container}) - ${status}`);
    } else {
      log(COLORS.red, `  DOWN - ${svc.name} (${svc.container}) - not found`);
    }
  }
}

function checkDatabases() {
  log(COLORS.bold + COLORS.cyan, '\n[4] Bases de Datos');
  log(COLORS.gray, '----------------------------------------');
  const dbs = [
    { name: 'PostgreSQL', container: 'catire_postgres_db' },
    { name: 'MongoDB Config', container: 'catire_config_db' },
    { name: 'MongoDB Audit', container: 'catire_audit_db' },
  ];
  for (const db of dbs) {
    const status = run(`docker inspect --format='{{.State.Status}}' ${db.container}`);
    if (status === 'running') {
      log(COLORS.green, `  OK  - ${db.name} (${db.container}) - running`);
    } else {
      log(COLORS.red, `  DOWN - ${db.name} - ${status || 'not found'}`);
    }
  }
}

function printSummary() {
  log(COLORS.bold + COLORS.cyan, '\n[5] Resumen');
  log(COLORS.gray, '----------------------------------------');
  const running = run('docker ps --format "{{.Names}}"').split('\n').filter(Boolean).length;
  const stopped = run('docker ps -a --filter "status=exited" --format "{{.Names}}"').split('\n').filter(Boolean).length;
  log(COLORS.green, `  Containers corriendo: ${running}`);
  if (stopped > 0) log(COLORS.yellow, `  Containers detenidos: ${stopped}`);
  console.log('');
  if (running >= 8) {
    log(COLORS.bold + COLORS.green, '  TODO FUNCIONANDO CORRECTAMENTE');
  } else if (running >= 4) {
    log(COLORS.bold + COLORS.yellow, '  ALGUNOS SERVICIOS CAIDOS');
  } else {
    log(COLORS.bold + COLORS.red, '  SERVICIOS CAIDOS - ejecuta docker-compose up -d');
  }
}

console.log('');
log(COLORS.bold + COLORS.cyan, '========================================');
log(COLORS.bold + COLORS.cyan, '  CATIRE HOT DOG - Health Check');
log(COLORS.bold + COLORS.cyan, '========================================');

checkDocker();
checkNginx();
checkServices();
checkDatabases();
printSummary();

console.log('');
