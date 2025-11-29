import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Базовый класс для всех инструментов SHALOM
 * Реализует общую логику MCP и позиционную семантику
 */
export abstract class BaseTool {
  /**
   * Имя инструмента (ивритское, например: שלום, זכור, ברא)
   */
  abstract readonly name: string;

  /**
   * Описание инструмента на английском для MCP
   */
  abstract readonly description: string;

  /**
   * Схема параметров в формате JSON Schema
   * Позиционная семантика: буллеты преобразуются в массив/объект
   */
  abstract readonly parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };

  /**
   * Выполнить инструмент с заданными параметрами
   * @param args - Параметры, извлечённые из позиционных буллетов
   * @returns Результат выполнения
   */
  abstract execute(args: any): Promise<any>;

  /**
   * Получить определение инструмента в формате MCP
   */
  getTool(): Tool {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.parameters
    };
  }

  /**
   * Валидация параметров перед выполнением
   * @param args - Параметры для валидации
   * @throws Error если валидация не пройдена
   */
  validate(args: any): void {
    // Проверка обязательных полей
    for (const field of this.parameters.required) {
      if (!(field in args)) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }

    // Дополнительная валидация может быть переопределена в наследниках
  }

  /**
   * Преобразовать позиционные буллеты в структурированные параметры
   * @param bullets - Массив строк из протокола SHALOM
   * @returns Объект параметров для execute()
   */
  protected parseBullets(bullets: string[]): Record<string, any> {
    // Базовая реализация: просто возвращает массив
    // Наследники могут переопределить для сложной логики
    return { items: bullets };
  }
}
