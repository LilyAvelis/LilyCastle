"""
Пример кода на Python, как оформляют function calling для AI-агентов.
Это псевдокод — не реальный вызов, а демонстрация синтаксиса.
В реальных фреймворках (LangChain, OpenAI API) это генерируется динамически.
"""

def call_tool_example(tool_name, **params):
    """
    Функция для формирования XML-вызова инструмента.
    В реальности это отправляется в executor (систему Copilot/Grok).
    """
    # Формируем XML
    xml = f"<xai:function_call name=\"{tool_name}\">"
    for key, value in params.items():
        xml += f"<parameter name=\"{key}\">{value}