import * as fs from 'fs';
import * as path from 'path';

export type DaoValue = string | number | boolean | string[] | null;

export interface PropertyHandler {
  key: string;
  parse: (value: string) => DaoValue;
  description?: string;
}

export class DaoReader {
  private static handlers = new Map<string, PropertyHandler>();
  
  // Регистрируем обработчик для свойства
  static registerHandler(handler: PropertyHandler) {
    this.handlers.set(handler.key, handler);
  }
  
  // Читаем .dao файл как плоский Map
  static readDaoFile(filePath: string): Map<string, DaoValue> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const dao = new Map<string, DaoValue>();
    
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      
      // Пропускаем пустые строки и комментарии
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Находим первый пробел
      const firstSpace = trimmed.indexOf(' ');
      if (firstSpace === -1) {
        // Ключ без значения = true (как флаг)
        dao.set(trimmed, true);
        continue;
      }
      
      const key = trimmed.slice(0, firstSpace);
      const valueStr = trimmed.slice(firstSpace + 1).trim();
      
      // Используем обработчик если есть, иначе авто-определение
      const handler = this.handlers.get(key);
      const value = handler ? handler.parse(valueStr) : this.parseValue(valueStr);
      
      dao.set(key, value);
    }
    
    return dao;
  }
  
  // Авто-определение типа значения
  private static parseValue(str: string): DaoValue {
    // Boolean
    if (str === 'true') return true;
    if (str === 'false') return false;
    
    // Number
    if (/^-?\d+$/.test(str)) return parseInt(str, 10);
    if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str);
    
    // Array
    if (str.startsWith('[') && str.endsWith(']')) {
      const content = str.slice(1, -1).trim();
      if (!content) return [];
      return content.split(',').map(s => s.trim());
    }
    
    // String (может быть в кавычках)
    if ((str.startsWith('"') && str.endsWith('"')) || 
        (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1);
    }
    
    return str;
  }
  
  // Получить все ключи (иероглифы) из файла
  static getKeys(dao: Map<string, DaoValue>): string[] {
    return Array.from(dao.keys());
  }
  
  // Получить значение по ключу
  static get(dao: Map<string, DaoValue>, key: string): DaoValue | undefined {
    return dao.get(key);
  }
  
  // Проверить существование ключа
  static has(dao: Map<string, DaoValue>, key: string): boolean {
    return dao.has(key);
  }
  
  // Найти .dao файл для исходника
  static findDaoForSource(sourceFilePath: string): string | null {
    const dir = path.dirname(sourceFilePath);
    const basename = path.basename(sourceFilePath, path.extname(sourceFilePath));
    const daoPath = path.join(dir, `${basename}.dao`);
    
    return fs.existsSync(daoPath) ? daoPath : null;
  }
  
  // Сканировать workspace на .dao файлы
  static scanWorkspace(workspacePath: string): Map<string, Map<string, DaoValue>> {
    const graph = new Map<string, Map<string, DaoValue>>();
    
    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('node_modules')) {
          scanDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.dao')) {
          const dao = DaoReader.readDaoFile(fullPath);
          const cubeName = path.basename(entry.name, '.dao');
          graph.set(cubeName, dao);
        }
      }
    }
    
    scanDir(workspacePath);
    return graph;
  }
}
