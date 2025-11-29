import { DaoReader } from '../garden-dao/dao-reader';
import * as path from 'path';

function testDaoReader() {
  console.log('🧪 测试 DAO Reader (新格式)\n');
  
  // Тест 1: Чтение .dao файла
  const daoPath = path.join(__dirname, '../../chatViewProvider.dao');
  console.log(`📖 读取: ${daoPath}`);
  
  const dao = DaoReader.readDaoFile(daoPath);
  
  if (!dao || dao.size === 0) {
    console.error('❌ 无法读取 .dao 文件或文件为空');
    process.exit(1);
  }
  
  console.log(`✅ 成功读取 ${dao.size} 个属性:\n`);
  
  // Выводим все свойства
  for (const [key, value] of dao) {
    console.log(`   ${key}: ${JSON.stringify(value)}`);
  }
  
  // Тест 2: Проверяем конкретные свойства
  console.log('\n🔍 测试访问属性:');
  
  const keys = DaoReader.getKeys(dao);
  console.log(`   所有键: [${keys.join(', ')}]`);
  
  if (DaoReader.has(dao, '需')) {
    console.log(`   需: ${JSON.stringify(DaoReader.get(dao, '需'))}`);
  }
  
  if (DaoReader.has(dao, '供')) {
    console.log(`   供: ${JSON.stringify(DaoReader.get(dao, '供'))}`);
  }
  
  if (DaoReader.has(dao, '禁')) {
    console.log(`   禁: ${JSON.stringify(DaoReader.get(dao, '禁'))}`);
  }
  
  // Тест 3: Поиск .dao для исходного файла
  console.log('\n🔍 测试查找 .dao 文件');
  const sourcePath = path.join(__dirname, '../../../04-Сад-Лилий/Garden/src/views/chatViewProvider.ts');
  const foundDao = DaoReader.findDaoForSource(sourcePath);
  
  if (foundDao) {
    console.log(`✅ 找到: ${foundDao}`);
  } else {
    console.log('⚠️  未找到对应的 .dao 文件');
  }
  
  // Тест 4: Сканирование workspace
  console.log('\n🔍 测试扫描 workspace:');
  const workspace = path.join(__dirname, '../../');
  const graph = DaoReader.scanWorkspace(workspace);
  console.log(`✅ 找到 ${graph.size} 个立方体`);
  
  console.log('\n🎉 所有测试完成!');
}

testDaoReader();
