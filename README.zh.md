<div align="center">

<img src="public/illustrations/reading-pastel.webp" alt="蜡笔柔色插画：Tikky与小鸡Pokklong在书桌前学习泰国宪法并做笔记" width="480" />

# 宪法，按我真正想学的方式来学

**一个免费、支持离线使用的泰国公务员考试学习网站，由 Dr. Non Arkaraprasertkul 为 Tikky 和其他备考者创建。**

**[开始阅读](https://constitution.nonarkara.org)** ·
[เริ่มอ่าน](https://constitution.nonarkara.org)

[ภาษาไทย (README.th.md)](./README.th.md) · [English (README.md)](./README.md) · [中文 (README.zh.md)](./README.zh.md)

</div>

---

## 写给正在备考的你

你会很累。你会在公交车上、在凌晨一点、或者在考前五周打开这个网站，心想*我应该早点开始的*。这个念头浪费掉的备考时间，比任何一门科目都多。

所以我先说一句没人会说的话：

**第一遍，你大部分都会答错。这正是设计本身。**

这个网站不是先给你讲解，而是一上来就让你在什么都没读的情况下，回答八十个考试主题。你会错掉大部分。每答错一题，网站就把那条*规则*（真正决定答案的那件事）交给你，然后再问你同一道题。答对之前，不会往下走。

这不是励志技巧。它借鉴的是关于记忆如何形成的真实研究，也是这个网站与一堆闪卡最根本的区别。

在决定怎么用之前，请先读下面的[学习循环](#学习循环一个概念五遍)，了解开始后会经历哪些步骤。

---

## 为什么要做这个

我是顾问，不是律师，也不是程序员。我看过很多人备考。我发现，几乎所有人都像学历史一样学宪法：读一章，划出重点句，感觉良好，然后考得很差。

这种做法有三个问题，这个网站分别给出了答案。

### 1. 阅读不等于学习

划重点让人觉得在用功，因为它费力。但正因如此，它并不能证明你学会了。几十年的研究结论一致：**自我测试和间隔复习**的效果远远好于重读和划重点；而自我解释、交错练习和图像联想是否有帮助，取决于具体任务和学习者（[Dunlosky 等，2013](https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html)）。间隔效应本身是公认的真实效应（[Cepeda 等，2006](https://www.psychologicalscience.org/publications/journals/pspi/spacing.pdf)），近期也有一篇更细致的综述讨论应如何安排提取练习（[Carpenter 等，2022](https://www.nature.com/articles/s44159-022-00089-1)）。

所以，这里的每一道题都是一次测试。答题*本身*就是学习。

### 2. 错误答案是整页上最有价值的东西

大多数应用把答错当作惩罚，标成红色，然后跳过。这等于把最有用的信息扔掉了。一次答错准确地告诉你，你哪里不懂，而那正是接下来一小时最值得投入的地方。

在这里，答错会产生一笔**欠账**。它会一直回来，直到你答对为止。不是背下那句话就算，也不是点两次跳过就算，而是要能用推理排除另外三个选项。这才是考试真正考的能力，也是唯一考的能力。

### 3. 规则可以迁移，句子不能

如果你背的是*“第213条的申诉要先经过监察专员”*，它只能帮你答一道题。如果你学会的是*“请求必须先交给行政机关，只有在该机关拒绝或60天不作回应时，才能诉诸法院”*，这条规则既能回答第213条，也能回答下一道同类题目。

本站全部 284 道 Pokklong 题和 90 道全真模拟题，在解析之外都附有一条明确的**规则**。有一项测试专门确保没有两道题共用同一条规则，因为被复制的规则只能用一次。

---

## 学习循环：一个概念，五遍

这就是整个产品。其他一切都只是通往它的入口。

```svg
<svg viewBox="0 0 860 260" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="The learning loop: sit blind, miss, learn the rule, answer again, earn it">
  <style>
    .box { fill: none; stroke: #111; stroke-width: 2; }
    .fill-a { fill: #E4002B; }   /* primary red   */
    .fill-b { fill: #F5C518; }   /* primary yellow*/
    .fill-c { fill: #0057B7; }   /* primary blue  */
    .lbl { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 15px; fill: #111; }
    .lbl-w { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 15px; fill: #fff; }
    .num { font-family: ui-monospace, monospace; font-size: 13px; fill: #111; }
  </style>

  <!-- step 1: blind -->
  <rect class="box fill-a" x="10" y="40" width="150" height="96"/>
  <text class="lbl-w" x="85" y="72" text-anchor="middle">Sit it blind</text>
  <text class="lbl-w" x="85" y="94" text-anchor="middle">80 topics.</text>
  <text class="lbl-w" x="85" y="114" text-anchor="middle">Nothing to read.</text>
  <text class="num" x="16" y="30">01</text>

  <!-- step 2: miss -->
  <line x1="160" y1="88" x2="205" y2="88" stroke="#111" stroke-width="2"/>
  <polygon points="205,88 195,83 195,93" fill="#111"/>
  <rect class="box" x="207" y="40" width="150" height="96"/>
  <text class="lbl" x="282" y="72" text-anchor="middle">You miss it.</text>
  <text class="lbl" x="282" y="94" text-anchor="middle">Most of them.</text>
  <text class="lbl" x="282" y="114" text-anchor="middle">That is the point.</text>
  <text class="num" x="213" y="30">02</text>

  <!-- step 3: the rule -->
  <line x1="357" y1="88" x2="402" y2="88" stroke="#111" stroke-width="2"/>
  <polygon points="402,88 392,83 392,93" fill="#111"/>
  <rect class="box fill-b" x="404" y="40" width="180" height="96"/>
  <text class="lbl" x="494" y="70" text-anchor="middle">Get the rule.</text>
  <text class="lbl" x="494" y="92" text-anchor="middle">The thing that</text>
  <text class="lbl" x="494" y="112" text-anchor="middle">decides the answer.</text>
  <text class="num" x="410" y="30">03</text>

  <!-- step 4: again -->
  <line x1="584" y1="88" x2="629" y2="88" stroke="#111" stroke-width="2"/>
  <polygon points="629,88 619,83 619,93" fill="#111"/>
  <rect class="box fill-c" x="631" y="40" width="150" height="96"/>
  <text class="lbl-w" x="706" y="72" text-anchor="middle">Answer again.</text>
  <text class="lbl-w" x="706" y="94" text-anchor="middle">Rule out the</text>
  <text class="lbl-w" x="706" y="114" text-anchor="middle">other three.</text>
  <text class="num" x="637" y="30">04</text>

  <!-- earned -->
  <rect x="700" y="170" width="150" height="52" fill="#111"/>
  <text x="775" y="202" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif"
        font-size="16" fill="#fff">Earned →</text>
  <path d="M 706 136 L 706 158 Q 706 170 718 170 L 700 170" fill="none" stroke="#111" stroke-width="2"/>

  <!-- loop back -->
  <path d="M 85 136 L 85 196 Q 85 208 97 208 L 620 208 Q 632 208 632 196 L 632 140"
        fill="none" stroke="#111" stroke-width="2" stroke-dasharray="6 5"/>
  <polygon points="632,136 627,146 637,146" fill="#111"/>
  <text x="358" y="228" text-anchor="middle" font-family="ui-monospace,monospace"
        font-size="13" fill="#111">wrong again → the rule stays up, and it comes right back</text>

  <text x="10" y="250" font-family="ui-sans-serif,system-ui,sans-serif" font-size="13" fill="#555">
    A question is not finished when you have seen the answer. It is finished when you can derive it.
  </text>
</svg>
```

再读一遍最后一行。它就是这个项目的全部论点：一道题不是看过答案就算完成，而是能自己推导出答案才算完成。

---

## 里面有什么

| | |
|---|---|
| **279 条条文** | 佛历2560年（2017）宪法全文，含2021年修正案。泰文为权威原文，附国务委员会英文译本和中文学习译本 |
| **837 段录音** | 每一条都有泰、英、中三种语言的朗读，在本地生成，并与原文逐条校验 |
| **470 道题** | 依据条文编写的练习题，附解析和出处 |
| **284 道 Pokklong 题** | 一条十二级阶梯，带你走完泰国地方行政管理 |
| **90 道全真模拟题** | 县长考试的 80 个考核主题，每题附一条排除规则 |
| **13 章指南** | 十三章内容，教的是推理，而不是清单 |
| **可离线使用** | 可安装，无需账号，不做追踪。学习进度只保存在你的设备上 |

---

## Pokklong：十二步

大多数想学 *ปกครอง*（行政治理）的人都在背条文编号。这里反其道而行：从最基础开始，一步一步搭建逻辑，每一步只依赖前一步。

```svg
<svg viewBox="0 0 860 300" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="The twelve Pokklong steps from why a state needs administration to control and accountability">
  <style>
    .s { stroke:#111; stroke-width:2; }
    .t { font-family: ui-sans-serif,system-ui,sans-serif; font-size:12.5px; fill:#111; }
    .n { font-family: ui-monospace,monospace; font-size:12px; fill:#111; }
  </style>
  <!-- asanoha-inspired grid of twelve cells -->
  <g>
    <rect class="s" fill="#E4002B" x="10"  y="20"  width="130" height="80"/>
    <rect class="s" fill="#fff"    x="150" y="20"  width="130" height="80"/>
    <rect class="s" fill="#0057B7" x="290" y="20"  width="130" height="80"/>
    <rect class="s" fill="#F5C518" x="430" y="20"  width="130" height="80"/>
    <rect class="s" fill="#fff"    x="570" y="20"  width="130" height="80"/>
    <rect class="s" fill="#111"    x="710" y="20"  width="130" height="80"/>
    <rect class="s" fill="#fff"    x="10"  y="110" width="130" height="80"/>
    <rect class="s" fill="#F5C518" x="150" y="110" width="130" height="80"/>
    <rect class="s" fill="#fff"    x="290" y="110" width="130" height="80"/>
    <rect class="s" fill="#0057B7" x="430" y="110" width="130" height="80"/>
    <rect class="s" fill="#fff"    x="570" y="110" width="130" height="80"/>
    <rect class="s" fill="#E4002B" x="710" y="110" width="130" height="80"/>
  </g>
  <text class="n" x="16"  y="14">01</text><text class="t" x="16"  y="44">Why a state</text><text class="t" x="16"  y="62">needs</text><text class="t" x="16"  y="80">administration</text>
  <text class="n" x="156" y="14">02</text><text class="t" x="156" y="44">The three</text><text class="t" x="156" y="62">tiers</text>
  <text class="n" x="296" y="14">03</text><text class="t" x="296" y="44">The centre:</text><text class="t" x="296" y="62">who heads what</text>
  <text class="n" x="436" y="14">04</text><text class="t" x="436" y="44">Province</text><text class="t" x="436" y="62">and district</text>
  <text class="n" x="576" y="14">05</text><text class="t" x="576" y="44">Self-rule</text>
  <text class="n" x="716" y="14">06</text><text class="t" x="716" y="44">Chain of</text><text class="t" x="716" y="62">command</text>
  <text class="n" x="16"  y="104">07</text><text class="t" x="16"  y="134">Legal acts:</text><text class="t" x="16"  y="152">orders and rules</text>
  <text class="n" x="156" y="104">08</text><text class="t" x="156" y="134">Who may</text><text class="t" x="156" y="152">decide</text>
  <text class="n" x="296" y="104">09</text><text class="t" x="296" y="134">Fair</text><text class="t" x="296" y="152">procedure</text>
  <text class="n" x="436" y="104">10</text><text class="t" x="436" y="134">Appeal,</text><text class="t" x="436" y="152">revocation</text>
  <text class="n" x="576" y="104">11</text><text class="t" x="576" y="134">Enforcement</text><text class="t" x="576" y="152">and notice</text>
  <text class="n" x="716" y="104">12</text><text class="t" x="716" y="134">Control and</text><text class="t" x="716" y="152">accountability</text>

  <text x="10" y="225" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14" fill="#111">
    <tspan font-weight="600">Guess first, then the why, then the logic so far.</tspan>
  </text>
  <text x="10" y="248" font-family="ui-sans-serif,system-ui,sans-serif" font-size="13" fill="#555">
    Each step adds one idea to a running summary. By step 12 you can rebuild Thai
  </text>
  <text x="10" y="266" font-family="ui-sans-serif,system-ui,sans-serif" font-size="13" fill="#555">
    bureaucratic logic from first principles instead of recalling section numbers.
  </text>
</svg>
```

每一步都在累积的摘要里加入一个概念：先猜，再看原因，再看到目前为止的逻辑。到第 12 步，你就能从基本原理重建泰国官僚体系的逻辑，而不是回忆条文编号。

**出处，以及“借来、改进、注明来源”的说明。** 主题清单，以及爱考数字和期限的出题习惯，来自 ประพันธ์ เวารัมย์ 编写的 *แนวข้อสอบ พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง พ.ศ. 2539*。这里的每道题都经过重写，**没有一道逐字照搬**，法律文本均对照泰文维基文库核实。我们还更正了该资料中的错误（列于 `source/slideshare-2539-INDEX.md`），并补充了它完全没有涉及的两个领域：国家结构，以及依据佛历2539年《官员侵权责任法》和佛历2540年《政府信息法》的问责机制。

这就是这个项目的全部原则：拿来好的结构，改正错误，并说明出处。

---

## 背后的心理学，以及我从哪里学来

我不是心理学家，这些也不是我的研究发现。下面是我读过、觉得有说服力的内容，以及每一项如何变成代码里的具体决定，也包括我刻意**没有**照做的地方。

| 概念 | 它说了什么 | 在这里改变了什么 |
|---|---|---|
| **测试效应**（提取练习） | 从记忆中提取信息，比往里装信息更能强化记忆 | 每道题先是测试。解析总在作答之后出现，从不提前 |
| **间隔效应**（Cepeda 等 2006） | 分散在几天里的复习胜过集中突击 | 答错的卡片会在 10 分钟后回来，然后是 1、3、7、14 天 |
| **高效用排名**（Dunlosky 等 2013） | 练习测试和间隔复习效用高，重读和划重点效用低 | 保留阅读与划重点作为批注工具，同时用问题检验能否回忆内容 |
| **效果因任务而异**（Carpenter 等 2022） | 自我解释、交错练习和图像联想对不同学习者、不同任务效果不同 | 这些只作为选项提供，从不断言。网站从不承诺你的成绩 |
| **先回忆再看选项** | 先回忆再选择，胜过不回忆直接选择 | 你先回忆，再看到选项。可以跳过，但这是默认设置 |
| **合意困难** | 在恰当时机的一点挣扎，换来之后的轻松 | 全真模拟不给你先读的机会。这份阻力就是功能本身 |

### 我拒绝声称的事

- **1/3/7/14 天**的复习间隔只是一个起步的经验法则，不是最优解。没有人证明过它对你最好。
- 本应用**不会给**你写的解释**打分**。它只保存并展示给你看。一台假装能评判它无法评估的推理的机器，比沉默更糟糕。
- 这里**没有 AI 教练**。没有模型在给你打分、追踪你的政治立场，或决定你该相信什么。一切都在你的浏览器里运行。这是自适应的提取练习，不是训练出来的系统，也不对你的观点作任何判断。
- **本站对你成绩的实际效果尚未经过检验。**我没有做过对照研究。我有的只是推理和一套测试。

### 我仍可能出错的地方

我是一个写法律的顾问。我仔细读过原文，每一章都请不为我工作的人对照泰文原文核对过。但**这不是法律意见，也不是官方考试大纲；法律体系中的一个错字，远比菜单上的错字严重。**每一页都标明出处和日期，请自行核对。如果与政府公报不一致，以政府公报为准，也请告诉我。

---

## 它是怎么构建的

Next.js 静态导出，由 Cloudflare Worker 提供服务。没有后端，没有账号，没有分析统计，没有追踪。可以安装到主屏幕，断网也能用。

```
app/          路由：每个页面都是静态 HTML
components/   交互界面
lib/          条文读取、学习模型、导航
data/         宪法、题目、指南，全部是纯 JSON
scripts/      校验器、构建步骤和发布关卡
tests/        测试：条文、题目、翻译、案例、界面
```

两条被强制执行、而不只是“打算遵守”的设计规则：

**每个数字都必须有条文为证。**一项测试会逐条检查全部 41 条速记表条目，确认每条引用的短语确实出现在所引条文的泰文原文中。如果期限写错，构建就会停止。

**每个说法都保留出处。**数据和新闻都附有来源和获取日期。来源之间有分歧时，页面会如实说明分歧，而不是挑一个方便的说法。

### 发布关卡

发布不等于“编译通过”：

```bash
npm run release   # 校验 → 测试 → 构建 → 生成文件漂移 → 链接、颜色、对比度
```

- **生成文件漂移**：构建会重新生成四个 `data/*.json` 文件，它们被提交进仓库以便网站导入。如果与全新构建的结果不一致，说明提交带上了过时的索引。
- **链接完整性**：每个构建页面中的每个内部链接，以及站点地图和三个播客订阅源，都必须能解析。
- **未定义的颜色变量**：任何主题都没定义的 `var(--x)` 会悄悄回退，速记表就曾因此在深色模式下只有 2.47:1 的对比度。
- **按 WCAG 类别检查对比度**：正文 4.5:1，组件边界 3:1，装饰性细线只报告、不判失败。一刀切的标准会在边框上误报，却漏掉真正的文字问题。
- **重定向路由靠声明，不靠猜**：一个转发页能通过所有存在性检查，却不值得被收录。所以 `lib/nav.ts` 中的 `REDIRECT_ROUTES` 明确列出它们，一旦被推广，关卡就会失败。

---

## 自己运行

```bash
git clone https://github.com/Nonarkara/constitution.git
cd constitution
nvm use            # Node 24，与 CI 一致
python3.12 -m venv .venv
.venv/bin/python -m pip install -r scripts/illustrations/requirements.txt
npm ci
npm run dev        # http://localhost:3000
npm run release    # 完整关卡
```

开发检查使用 Node 24、Python 3.12 和固定版本的图像依赖。
核心学习功能无需账号或 API 密钥。在线新闻标题使用 Cloudflare Worker 和 D1 数据库；本地学习仍可阅读已保存的新闻版本。

---

## 许可与致谢

代码以 **MIT 许可证**发布，详见 [LICENSE](LICENSE)。

宪法本身是公共文件。泰文为权威文本，英文译本出自国务委员会，每页注明学习性更正。中文为学习译本，并已如此标注。

条文录音为合成语音，依据泰文原文在本地生成并逐条校验。它们不是国务委员会或参议院的录音；那些音频另行链接，并保留其原有条款。

Pokklong 的主题结构归功于 ประพันธ์ เวารัมย์ 的佛历2539年考试资料，如上所述：已重写、已更正、已注明出处。

研究文献：[Dunlosky 等 2013](https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html) ·
[Cepeda 等 2006](https://www.psychologicalscience.org/publications/journals/pspi/spacing.pdf) ·
[Carpenter 等 2022](https://www.nature.com/articles/s44159-022-00089-1)

---

<div align="center">

**祝你好运。第一次就答错吧，那正是有效的部分。**

由 [Dr. Non Arkaraprasertkul](https://constitution.nonarkara.org/research) 和一小群被要求检查他的智能体共同构建。

</div>
