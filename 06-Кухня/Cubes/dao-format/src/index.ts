export * from './garden-dao/dao-reader';

import { DaoReader } from './garden-dao/dao-reader';

// Основная функция для CLI
export function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'read':
      const daoPath = args[1];
      if (!daoPath) {
        console.error('用法: dao read <path-to-dao-file>');
        process.exit(1);
      }
      const dao = DaoReader.readDaoFile(daoPath);
      console.log(`📖 读取: ${daoPath}\n`);
      console.log(`找到 ${dao.size} 个属性:\n`);
      for (const [key, value] of dao) {
        console.log(`  ${key}: ${JSON.stringify(value)}`);
      }
      break;
      
    case 'find':
      const sourcePath = args[1];
      if (!sourcePath) {
        console.error('用法: dao find <path-to-source-file>');
        process.exit(1);
      }
      const foundDao = DaoReader.findDaoForSource(sourcePath);
      console.log(foundDao || '未找到 .dao 文件');
      break;
      
    case 'scan':
      const workspace = args[1] || process.cwd();
      console.log(`🔍 扫描工作区: ${workspace}\n`);
      const graph = DaoReader.scanWorkspace(workspace);
      console.log(`📊 找到 ${graph.size} 个立方体:\n`);
      for (const [name, dao] of graph) {
        console.log(`  🧊 ${name}`);
        const 需 = dao.get('需');
        const 供 = dao.get('供');
        const 禁 = dao.get('禁');
        if (需) console.log(`     需: ${JSON.stringify(需)}`);
        if (供) console.log(`     供: ${JSON.stringify(供)}`);
        if (禁) console.log(`     禁: ${JSON.stringify(禁)}`);
        console.log('');
      }
      break;
      
    default:
      console.log(`
🈯 Garden DAO 工具 - 读取 .dao (道) 文件

用法:
  dao read <file.dao>    - 读取并显示 .dao 文件
  dao find <file.ts>     - 查找对应的 .dao 文件
  dao scan [workspace]   - 扫描工作区中的所有立方体

示例:
  dao read chatViewProvider.dao
  dao find src/views/chatViewProvider.ts
  dao scan ./
`);
  }
}

// 如果是直接运行
if (require.main === module) {
  main();
}
