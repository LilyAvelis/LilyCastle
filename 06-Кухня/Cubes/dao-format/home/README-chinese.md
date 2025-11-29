# 🈯 Garden DAO Format - 代码的道

> "代码即道，道即代码" - Код есть Дао, Дао есть код

## 什么是 .dao 格式？

`.dao` (道) 格式是一种全新的代码描述方式，灵感来自中文的**表意文字系统**。

每个代码文件都有两个层面：

- **体 (Body)** - 传统的代码实现 (`.ts`, `.js` 等)
- **道 (Dao)** - 语义层，描述代码的**本质、关系与约束** (`.dao`)

### 核心理念

在中文中，一个字 = 一个完整的概念：

- 木 = 树
- 林 = 树林 (木+木)
- 森 = 森林 (木+木+木)

`.dao` 格式对代码做同样的事：

- 每个"立方体" (кубик) = 一个逻辑单元
- 关系 = 需 (需要) + 供 (提供)
- 约束 = 禁 (禁止)

## 文件结构

```
src/
  views/
    chatViewProvider.ts      ← 体 (代码实现)
    chatViewProvider.dao     ← 道 (语义描述)
```

## .dao 文件示例

```yaml
道: ChatViewProvider
类: class
层: core
需: [OpenRouterClient, LedgerService, vscode.WebviewView]
供: [chat-visual-layer, message-routing]
禁: [不碰计费, 不写FS, 不直接调API]
态: stable
位: { 文件: "chatViewProvider.ts", 行: "21-95" }
述: "花园聊天的视觉层，管理Webview消息路由"

立方:
  - 名: resolveWebviewView
    需: [vscode.WebviewView]
    供: [webview-init]
    禁: [不修改全局状态]
    态: stable
    位: { 行: "41-60" }

  - 名: handleMessage
    需: [openRouterClient, ledgerService]
    供: [message-processing]
    禁: [不阻塞UI]
    态: stable
    位: { 行: "61-80" }
```

### 字段说明

| 字段     | 含义                  | 示例                                |
| -------- | --------------------- | ----------------------------------- |
| **道**   | 路径/名称             | `ChatViewProvider`                  |
| **类**   | 类型                  | `class`, `function`, `service`      |
| **层**   | 架构层级              | `core`, `edge`, `experimental`      |
| **需**   | 依赖 (需要什么)       | `[OpenRouterClient, LedgerService]` |
| **供**   | 提供 (服务什么)       | `[chat-visual-layer]`               |
| **禁**   | 约束 (禁止做什么)     | `[不碰计费, 不写FS]`                |
| **态**   | 状态                  | `stable`, `draft`, `refactor`       |
| **位**   | 位置 (在代码中的位置) | `{文件, 行}`                        |
| **述**   | 描述                  | 简短语义说明                        |
| **立方** | 子立方体 (方法/函数)  | 数组                                |

## 安装与使用

### 安装

```bash
cd 06-Кухня/Cubes/dao-format
npm install
npm run build
```

### CLI 工具

#### 1. 读取 .dao 文件

```bash
node bin/dao.js read chatViewProvider.dao
```

输出:

```json
{
  "道": "ChatViewProvider",
  "类": "class",
  "层": "core",
  "需": ["OpenRouterClient", "LedgerService", "vscode.WebviewView"],
  ...
}
```

#### 2. 查找对应的 .dao 文件

```bash
node bin/dao.js find src/views/chatViewProvider.ts
```

#### 3. 扫描工作区中的所有立方体

```bash
node bin/dao.js graph ./
```

输出:

```
📊 找到 1 个立方体:

  🧊 ChatViewProvider
     类型: class
     层级: core
     状态: stable
     需: OpenRouterClient, LedgerService, vscode.WebviewView
     供: chat-visual-layer, message-routing
```

#### 4. 生成 .dao 文件 (开发中)

```bash
node bin/dao.js init src/views/chatViewProvider.ts
```

## 为什么用中文关键字？

### 1. **信息密度**

英文: `requires: [OpenRouterClient, LedgerService]` (8 + 变量)
中文: `需: [OpenRouterClient, LedgerService]` (1 + 变量)

**节省 87.5% 的字符！**

### 2. **语义清晰**

- **需** (xū) = 需要、需求、必须
- **供** (gōng) = 提供、供应、服务
- **禁** (jìn) = 禁止、约束、边界

每个字都是**千年精炼**的语义精华。

### 3. **对 AI 友好**

中文的**表意性**让 AI 更容易理解**概念间的关系**，而不是纠结于语法。

## 工作流程

### 传统方式:

```
1. 阅读 500 行代码
2. "嗯... 大概懂了"
3. 修改代码
4. 💥 破坏了隐藏依赖
```

### DAO 方式:

```
1. 阅读 .dao 文件 (20 行)
2. 理解: "哦，这是核心层，需要 X，提供 Y，不能碰 Z"
3. 通过关系图看到所有依赖
4. 精确修改，不破坏约束
```

## 与 Garden Eye + Knife 的集成

`.dao` 格式完美配合现有工具：

1. **Garden Eye** (`skeleton`) - 扫描代码结构
2. **Garden Knife** - 精确修改代码
3. **Garden DAO** - 理解代码语义

```bash
# 完整工作流程:
skeleton chatViewProvider.ts      # 看结构
dao read chatViewProvider.dao     # 看语义
knife ChatViewProvider.handleMessage  # 修改代码
```

## 哲学理念

> "道可道，非常道" - 老子

**体 (Body)** = 道的表现 (реализация)
**道 (Dao)** = 体的本质 (семантика)

ИИ 理解 **道**，人类编写 **体**。

## 下一步计划

- [ ] 自动生成 .dao 文件 из исходного кода
- [ ] 可视化依赖图
- [ ] DAO 验证工具 (检查约束)
- [ ] VS Code 插件 для .dao 语法高亮
- [ ] AI 助手，专门理解 .dao 格式

## 贡献

这是实验性 формат，欢迎建议！

---

**作者**: Lily (Лилия)
**灵感**: 中文表意文字系统 + 道家哲学
**位置**: `06-Кухня/Cubes/dao-format` (因为厨房是实验的地方!)
