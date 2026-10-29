// The count-rules the exam traps on and the app never registered.
//
// Every entry carries the Thai words that prove it, taken verbatim from the
// section it belongs to, so `tests/facts.test.ts` can check each one against
// the statute rather than against a human's memory.
//
// `meaning` states the RULE the number decides. `joke` is the handle: a
// concrete image the learner can picture in the room the rule lives in.
// The cast is the house's own — the duck, the cat, the sparrow, the turtle,
// the owl with the binoculars the wrong way round.
export const NEW_FACTS = [
  {
    "id": "amend-readings",
    "section": 256,
    "proof": "เป็นสามวาระ",
    "label": {
      "th": "ขั้นตอนการแก้ไขเพิ่มเติมรัฐธรรมนูญ",
      "en": "The stages of a constitutional amendment",
      "zh": "宪法修正案的审议阶段"
    },
    "value": {
      "th": "3 วาระ",
      "en": "3 readings",
      "zh": "3次审议"
    },
    "meaning": {
      "th": "ร่างรัฐธรรมนูญแก้ไขเพิ่มเติมต้องเสนอต่อรัฐสภาและให้รัฐสภาพิจารณาเป็นสามวาระ แต่ละวาระมีเงื่อนไขการลงคะแนนของตัวเอง",
      "en": "An amendment bill must go to Parliament and be taken through three readings, each with its own voting condition.",
      "zh": "宪法修正案草案须提交议会并经过三次审议，每次审议各有其表决条件。"
    },
    "joke": {
      "th": "สามห้อง สามกุญแจที่ไม่เหมือนกัน ผ่านห้องหนึ่งแล้วยังเหลืออีกสองห้อง",
      "en": "Three rooms, three different locks: getting through one still leaves two more.",
      "zh": "三间屋，三把不同的锁，过了一间还剩两间。"
    }
  },
  {
    "id": "court-composition",
    "section": 200,
    "proof": "จำนวนสามคน",
    "label": {
      "th": "ที่มาของตุลาการศาลรัฐธรรมนูญ 9 คน",
      "en": "Where the Court's nine judges come from",
      "zh": "宪法法院九名法官的来源"
    },
    "value": {
      "th": "3 ศาลฎีกา + 2 ศาลปกครองสูงสุด + 4 ผู้ทรงคุณวุฒิ",
      "en": "3 judges of the Supreme Court, 2 judges of the Supreme Administrative Court, 4 others",
      "zh": "最高法院3人＋最高行政法院2人＋其他4人"
    },
    "meaning": {
      "th": "ตุลาการศาลรัฐธรรมนูญ 9 คน มาจากศาลฎีกา 3 คน ศาลปกครองสูงสุด 2 คน และผู้ทรงคุณวุฒิที่ได้รับการสรรหา 4 คน ซึ่งแยกเป็นนักกฎหมาย 1 คน นักรัฐศาสตร์หรือรัฐประศาสนศาสตร์ 1 คน และผู้ทรงคุณวุฒิที่เคยรับราชการระดับอธิบดีหรือเทียบเท่า หรือไม่ต่ำกว่ารองอัยการสูงสุด 2 คน",
      "en": "The Court's nine judges come from the Supreme Court (3), the Supreme Administrative Court (2), and four qualified persons obtained by selection: a legal scholar (1), a political or public-administration scholar (1), and two former officials of director-general rank or equivalent, or of deputy attorney-general rank or above (2).",
      "zh": "宪法法院九名法官来自：最高法院3人、最高行政法院2人，以及经遴选产生的4人（法学家1人、政治或公共行政学者1人、曾任厅长级或同等职位、或副总检察长级以上的官员2人）。"
    },
    "joke": {
      "th": "เก้าอี้มีคนมานั่งเก้าคน แต่ที่มาของแต่ละคนไม่เหมือนกัน จำแค่เก้าก็ไม่พอ",
      "en": "Nine chairs, nine people, but they do not all come from the same door. Counting to nine is not enough.",
      "zh": "九把椅子九个人，但人人的来路不同；只数到九还不够。"
    }
  },
  {
    "id": "party-vote-3of4",
    "section": 101,
    "proof": "สามในสี่ของที่ประชุมร่วม",
    "match": [
      "three-quarters",
      "three quarters",
      "three-quarter",
      "3/4"
    ],
    "label": {
      "th": "สมาชิกพรรคเปลี่ยนพรรคด้วยเสียงของพรรค",
      "en": "A member changing party by a party vote",
      "zh": "议员改换政党须经本党表决"
    },
    "value": {
      "th": "อย่างน้อย 3 ใน 4 ของที่ประชุมร่วม",
      "en": "At least three-quarters of the joint meeting",
      "zh": "至少联合会议的四分之三"
    },
    "meaning": {
      "th": "สมาชิกสภาผู้แทนราษฎรพ้นจากการเป็นสมาชิกพรรคได้ตามมติด้วยคะแนนเสียงไม่น้อยกว่าสามในสี่ของที่ประชุมร่วมของคณะกรรมการบริหารพรรคและสมาชิกสภาผู้แทนราษฎรที่สังกัดพรรคนั้น หากไม่ได้เข้าเป็นสมาชิกพรรคอื่นภายในสามสิบวันนับแต่วันที่พรรคมีมติ สมาชิกภาพของสมาชิกสภาผู้แทนราษฎรสิ้นสุดนับแต่วันที่พ้นสามสิบวันนั้น",
      "en": "A member of the House stops being a party member on a party resolution passed by at least three-quarters of the joint meeting of the party's executive and its MPs. If the member has not joined another party within 30 days of that resolution, House membership ends after day 30.",
      "zh": "众议员可依本党决议脱离党籍，决议须经本党执行委员会与本党众议员联合会议至少四分之三表决通过。该议员若自决议之日起三十日内未加入他党，其众议员资格自三十日届满后终止。"
    },
    "joke": {
      "th": "ที่ประชุมร่วมนั่งกันสี่คน ต้องยกมือเห็นด้วยอย่างน้อยสามคน ถ้ายกแค่สองคนยังไม่พอ",
      "en": "Four people sit at the party's joint meeting; at least three must raise a hand, and two is not enough.",
      "zh": "党的联合会议每四个人里，至少三人举手赞成，只有两人还不够。"
    }
  },
  {
    "id": "amend-senate-petition",
    "section": 256,
    "proof": "ไม่น้อยกว่าหนึ่งในสิบ",
    "match": [
      "one tenth",
      "one-tenth",
      "1/10",
      "a tenth",
      "one-tenth of"
    ],
    "label": {
      "th": "สมาชิกสภาเข้าชื่อท้วงร่างรัฐธรรมนูญแก้ไขเพิ่มเติม",
      "en": "Members petitioning against a constitutional amendment draft",
      "zh": "议员联署质疑宪法修正案草案"
    },
    "value": {
      "th": "ไม่น้อยกว่า 1 ใน 10 ของสมาชิกสภาที่ตนสังกัด (หรือของทั้งสองสภารวมกัน)",
      "en": "At least one tenth of the members of their House (or of both Houses combined)",
      "zh": "不少于所属议院（或两院合计）议员的十分之一"
    },
    "meaning": {
      "th": "ก่อนนายกรัฐมนตรีนำร่างรัฐธรรมนูญแก้ไขเพิ่มเติมขึ้นทูลเกล้าฯ สมาชิกสภาผู้แทนราษฎร สมาชิกวุฒิสภา หรือสมาชิกทั้งสองสภารวมกัน จำนวนไม่น้อยกว่าหนึ่งในสิบของสมาชิกทั้งหมดเท่าที่มีอยู่ของสภานั้นหรือของทั้งสองสภารวมกัน มีสิทธิเข้าชื่อเสนอความเห็นผ่านประธานสภาไปยังศาลรัฐธรรมนูญ ว่าร่างนั้นขัดมาตรา 255 หรือต้องทำประชามติก่อน ศาลต้องวินิจฉัยภายใน 30 วัน และระหว่างนั้นนายกรัฐมนตรีนำร่างขึ้นทูลเกล้าฯ ไม่ได้",
      "en": "Before the Prime Minister presents an amendment draft for signature, members of the House, the Senate, or both Houses together, numbering at least one tenth of all existing members of that House (or of both Houses combined), may sign a petition, sent through the President of the House or of the National Assembly to the Constitutional Court, saying the draft contravenes section 255 or first needs a referendum. The Court must decide within 30 days, and until then the Prime Minister may not present the draft.",
      "zh": "总理呈请签署修正案草案前，众议院、参议院或两院合计不少于所属议院（或两院合计）现有议员十分之一的议员，有权联署意见，经议长送交宪法法院，主张该草案违反第255条或须先举行公投。法院须在30日内裁决，在此期间总理不得呈请签署该草案。"
    },
    "joke": {
      "th": "ทุกสิบที่นั่ง อย่างน้อยหนึ่งที่นั่งเข้าชื่อท้วงได้ ร่างก็ต้องรอคำวินิจฉัยของศาลรัฐธรรมนูญไม่เกินสามสิบวัน",
      "en": "At least one seat in every ten signs the objection, and the draft must wait up to thirty days for the Constitutional Court.",
      "zh": "每十个席位里至少一个联署反对，草案就得等宪法法院裁决，最长三十天。"
    }
  },
  {
    "id": "privy-council",
    "section": 10,
    "proof": "ไม่เกินสิบแปดคน",
    "label": {
      "th": "คณะองคมนตรีทั้งคณะ",
      "en": "The Privy Council in all",
      "zh": "枢密院全体"
    },
    "value": {
      "th": "ไม่เกิน 19 คน (ประธาน 1 + อีกไม่เกิน 18)",
      "en": "At most 19 (1 president + up to 18)",
      "zh": "至多19人（主席1人＋其他至多18人）"
    },
    "meaning": {
      "th": "องคมนตรีมีประธาน 1 คน และองคมนตรีอื่นอีกไม่เกิน 18 คน รวมทั้งคณะไม่เกิน 19 คน",
      "en": "One President of the Privy Council plus at most 18 other members: 19 in all.",
      "zh": "枢密院主席1人加其他成员至多18人，全体不超过19人。"
    },
    "joke": {
      "th": "โต๊ะยาวมีเก้าอี้หัวโต๊ะหนึ่งตัว กับเก้าอี้ข้างโต๊ะอีกไม่เกินสิบแปดตัว รวมแล้วไม่เกินสิบเก้า",
      "en": "A long table has one chair at the head and no more than eighteen along the sides: nineteen at most.",
      "zh": "长桌一头摆一把主席椅，两侧至多十八把，合计至多十九把。"
    }
  },
  {
    "id": "welfare-age",
    "section": 48,
    "proof": "อายุเกินหกสิบปี",
    "label": {
      "th": "สิทธิของผู้สูงอายุที่ยากไร้",
      "en": "Poor elders' right to State assistance",
      "zh": "贫困老人的国家补助权"
    },
    "value": {
      "th": "เกิน 60 ปี",
      "en": "Over 60",
      "zh": "超过60岁"
    },
    "meaning": {
      "th": "ผู้ที่มีอายุเกิน 60 ปีและไม่มีรายได้เพียงพอแก่การยังชีพ ย่อมมีสิทธิได้รับความช่วยเหลือที่เหมาะสมจากรัฐตามที่กฎหมายบัญญัติ",
      "en": "Anyone over 60 without enough income to live on has a right to appropriate State assistance, as the law provides.",
      "zh": "年逾六十且收入不足以维持生计者，有权依法获得国家适当援助。"
    },
    "joke": {
      "th": "วันครบหกสิบปีพอดียังไม่ถึงเกณฑ์ พอข้ามไปอีกหนึ่งวัน อายุก็เกินหกสิบแล้ว",
      "en": "On the sixtieth birthday itself the cake does not qualify; from the day after, the person is over sixty and does.",
      "zh": "六十岁生日当天还不够格；过了这一天，就超过六十岁，够格了。"
    }
  },
  {
    "id": "ag-petition",
    "section": 49,
    "proof": "ภายในสิบห้าวัน",
    "label": {
      "th": "อัยการสูงสุดต้องดำเนินการต่อร้องขอ",
      "en": "The Attorney General must act on the petition",
      "zh": "总检察长须处理申诉"
    },
    "value": {
      "th": "ภายใน 15 วัน",
      "en": "Within 15 days",
      "zh": "15天内"
    },
    "meaning": {
      "th": "ถ้าอัยการสูงสุดมีคำสั่งไม่รับดำเนินการ หรือไม่ดำเนินการภายใน 15 วันนับแต่วันที่ได้รับคำร้องขอ ผู้ร้องขอยื่นคำร้องโดยตรงต่อศาลรัฐธรรมนูญได้",
      "en": "If the Attorney General refuses to take the petition up, or does not act within 15 days of receiving it, the petitioner may go straight to the Constitutional Court.",
      "zh": "总检察长收到申诉后十五日内未处理或不接受，申诉人可直接向宪法法院申诉。"
    },
    "joke": {
      "th": "คำร้องวางอยู่บนโต๊ะอัยการสูงสุด ถ้าเงียบไปสิบห้าวัน หรือถูกปฏิเสธ ผู้ร้องก็เดินถือคำร้องไปศาลรัฐธรรมนูญเอง",
      "en": "The petition sits on the Attorney General's desk. After fifteen days of silence, or a refusal, the petitioner carries it to the Constitutional Court personally.",
      "zh": "申诉书放在总检察长的桌上。沉默十五天，或被拒绝，申诉人就亲自把它送到宪法法院。"
    }
  },
  {
    "id": "utility-51",
    "section": 56,
    "proof": "ร้อยละห้าสิบเอ็ด",
    "label": {
      "th": "สัดส่วนที่รัฐต้องถือครองในโครงสร้างพื้นฐานของสาธารณูปโภค",
      "en": "The State's share in essential utility infrastructure",
      "zh": "国家在基本公用事业基础设施中的持股比例"
    },
    "value": {
      "th": "อย่างน้อย 51%",
      "en": "At least 51%",
      "zh": "至少51%"
    },
    "meaning": {
      "th": "โครงสร้างหรือโครงข่ายขั้นพื้นฐานของสาธารณูปโภคที่จำเป็นต่อการดำรงชีวิตของประชาชนหรือความมั่นคงของรัฐ รัฐต้องเป็นเจ้าของไม่น้อยกว่าร้อยละ 51 จะทำให้ตกเป็นกรรมสิทธิ์ของเอกชนหรือเหลือน้อยกว่านั้นไม่ได้",
      "en": "For the basic structure or network of utility services vital to people's subsistence or State security, the State must own at least 51% and may not let it pass to private ownership or fall below that.",
      "zh": "对于人民生计或国家安全所必需的基本公用事业的基础设施或网络，国家持有比例不得低于51%，不得使其归私人所有或降至该比例以下。"
    },
    "joke": {
      "th": "ท่อส่งน้ำถูกตัดเป็นร้อยท่อน รัฐต้องถือห้าสิบเอ็ดท่อน ถือห้าสิบท่อนยังขาดอีกหนึ่ง",
      "en": "A pipeline cut into one hundred lengths: the State must own fifty-one of them, and fifty is one short.",
      "zh": "一条管道切成一百段，国家要拥有五十一段，五十段还差一段。"
    }
  },
  {
    "id": "joint-sitting-95",
    "section": 84,
    "proof": "เก้าสิบห้าของจำนวนสมาชิกสภาผู้แทนราษฎรทั้งหมด",
    "label": {
      "th": "เรียกประชุมรัฐสภาระหว่างการเลือกตั้ง",
      "en": "Convening Parliament during an election",
      "zh": "选举期间召集议会"
    },
    "value": {
      "th": "ร้อยละ 95",
      "en": "95 percent",
      "zh": "百分之95"
    },
    "meaning": {
      "th": "ในการเลือกตั้งทั่วไป เมื่อมีสมาชิกสภาผู้แทนราษฎรได้รับเลือกตั้งถึงร้อยละ 95 ของจำนวนทั้งหมดแล้ว หากจำเป็นก็เรียกประชุมรัฐสภาได้ โดยถือว่าสภาผู้แทนราษฎรประกอบด้วยสมาชิกเท่าที่มีอยู่ แต่ต้องรีบทำให้ครบตามจำนวน",
      "en": "In a general election, once 95% of all MPs have been elected, Parliament may be convened if necessary, with the House deemed to consist of the members it actually has; the missing seats must be filled quickly.",
      "zh": "普选中，当选众议员达到全体的95%后，如有必要可召集议会开会，此时众议院视为由现有议员组成，但须尽快补足缺额。"
    },
    "joke": {
      "th": "ทุกร้อยที่นั่งมีคนนั่งแล้วเก้าสิบห้าที่ ก็เปิดประชุมได้ โดยนับเฉพาะที่นั่งที่มีคน ส่วนห้าที่ว่างต้องรีบหาคนมาเติม",
      "en": "Ninety-five of every hundred seats are taken, so the sitting may open and counts only the seats filled; the five empty ones must be filled soon.",
      "zh": "每一百个座位坐了九十五个，就可以开会，只计算有人的座位；空着的五个要尽快补上人。"
    }
  },
  {
    "id": "mp-constituency",
    "section": 86,
    "proof": "สี่ร้อยคน",
    "label": {
      "th": "สมาชิกสภาผู้แทนราษฎรเขตเลือกตั้ง",
      "en": "Constituency MPs",
      "zh": "选区议员"
    },
    "value": {
      "th": "400 คน",
      "en": "400",
      "zh": "400人"
    },
    "meaning": {
      "th": "จำนวนราษฎรทั้งประเทศตามหลักฐานการทะเบียน เฉลี่ยด้วยจำนวนสมาชิกสภาผู้แทนราษฎรสี่ร้อยคน จึงได้จำนวนราษฎรต่อสมาชิกหนึ่งคน",
      "en": "The national population on the latest register, divided by 400 constituency MPs, gives the population per MP.",
      "zh": "按最新人口登记册总人口除以400名选区议员，即得出每名议员对应的人口数。"
    },
    "joke": {
      "th": "สี่ร้อยที่นั่งเขต บัญชีรายชื่ออีกร้อย รวมห้าร้อย แต่ที่นั่งเขตคือสี่ร้อยพอดี",
      "en": "Four hundred constituency seats, one hundred more on the list, five hundred together — but the constituency is exactly four hundred.",
      "zh": "选区四百席加名单一百席共五百，但选区正好是四百。"
    }
  },
  {
    "id": "nomination-days",
    "section": 97,
    "proof": "ระยะเวลาเก้าสิบวันดังกล่าวให้ลดลงเหลือสามสิบวัน",
    "label": {
      "th": "ระยะเวลาเป็นสมาชิกพรรคก่อนลงสมัคร",
      "en": "Party membership before standing",
      "zh": "参选前的党籍年限"
    },
    "value": {
      "th": "90 วัน (เหลือ 30 วันเมื่อเลือกตั้งเพราะยุบสภา)",
      "en": "90 days (30 if the election follows a dissolution)",
      "zh": "90天（因解散而选举时为30天）"
    },
    "meaning": {
      "th": "ผู้สมัครต้องเป็นสมาชิกพรรคการเมืองติดต่อกันไม่น้อยกว่า 90 วันนับถึงวันเลือกตั้ง เว้นแต่เป็นการเลือกตั้งทั่วไปเพราะยุบสภา ระยะเวลานั้นลดลงเหลือ 30 วัน",
      "en": "A candidate must have been a party member for at least 90 days before the poll; in a general election following a dissolution that falls to 30 days.",
      "zh": "候选人须在投票日前连续为党员不少于90天；因解散而举行的普选减为30天。"
    },
    "joke": {
      "th": "เป็ดยืนในประตูรอคิวเก้าสิบวัน ถ้าประตูถูกยุบลง เหลือสามสิบวัน",
      "en": "The duck waits ninety days at the gate. If the gate is demolished, thirty will do.",
      "zh": "鸭子在大门前等了九十天；门若被拆掉，三十天就行。"
    }
  },
  {
    "id": "party-dissolve-60",
    "section": 101,
    "proof": "ภายในหกสิบวัน",
    "label": {
      "th": "สมาชิกเมื่อพรรคถูกยุบต้องเข้าสังกัดพรรคอื่น",
      "en": "An MP whose party is dissolved must join another",
      "zh": "政党被解散后议员须加入他党"
    },
    "value": {
      "th": "60 วัน",
      "en": "60 days",
      "zh": "60天"
    },
    "meaning": {
      "th": "สมาชิกสภาผู้แทนราษฎรที่พรรคถูกสั่งยุบ หากเข้าเป็นสมาชิกพรรคอื่นไม่ได้ภายในหกสิบวันนับแต่วันที่มีคำสั่งยุบพรรค สมาชิกภาพสิ้นสุดนับแต่วันถัดจากวันที่ครบหกสิบวัน",
      "en": "If an MP's party is dissolved by order and the MP cannot join another party within 60 days of the dissolution order, membership of the House ends from the day after the 60 days run out.",
      "zh": "所属政党被命令解散的众议员，若自解散命令之日起六十日内未能加入他党，其议员资格自第六十日届满的次日起终止。"
    },
    "joke": {
      "th": "หลังมีคำสั่งยุบพรรค ส.ส. มีเวลาหาพรรคใหม่หกสิบวัน พอถึงวันที่หกสิบเอ็ด เก้าอี้ก็ไม่ใช่ของเขาแล้ว",
      "en": "After the dissolution order the MP has sixty days to find a new party; on day sixty-one the chair is no longer theirs.",
      "zh": "解散命令下达后，议员有六十天另找新政党；到第六十一天，这把椅子就不再属于他了。"
    }
  },
  {
    "id": "by-election-180",
    "section": 105,
    "proof": "เหลืออยู่ไม่ถึงหนึ่งร้อยแปดสิบวัน",
    "label": {
      "th": "เลือกตั้งแทนที่นั่งเขตเลือกตั้งที่ว่าง",
      "en": "By-election for a vacant constituency seat",
      "zh": "选区议席出缺的补选"
    },
    "value": {
      "th": "ไม่จัดถ้าเหลืออายุสภาไม่ถึง 180 วัน",
      "en": "Not held if under 180 days of the House's term remain",
      "zh": "剩余任期不足180天则不举行"
    },
    "meaning": {
      "th": "เมื่อที่นั่งสมาชิกแบบแบ่งเขตเลือกตั้งว่างลง ต้องจัดเลือกตั้งแทน เว้นแต่อายุของสภาผู้แทนราษฎรเหลืออยู่ไม่ถึงหนึ่งร้อยแปดสิบวัน และให้นำมาตรา 102 มาใช้บังคับโดยอนุโลม",
      "en": "When a constituency seat falls vacant, a by-election must be held unless less than 180 days of the House's term remain; section 102 applies with the necessary changes.",
      "zh": "选区议席出缺时须举行补选，但众议院任期剩余不足一百八十天的除外；准用第一百零二条。"
    },
    "joke": {
      "th": "ปฏิทินเหลือไม่ถึงหนึ่งร้อยแปดสิบวัน เก้าอี้ที่ว่างก็ปล่อยว่างไว้ แต่ถ้าเหลือหนึ่งร้อยแปดสิบวันขึ้นไป ต้องจัดเลือกตั้งแทน",
      "en": "A calendar with fewer than one hundred and eighty days left: the empty chair stays empty. With one hundred and eighty or more, an election is held.",
      "zh": "日历上剩不到一百八十天，空椅子就让它空着；剩一百八十天或更多，就要补选。"
    }
  },
  {
    "id": "gazette-7",
    "section": 105,
    "proof": "ประกาศในราชกิจจานุเบกษาภายในเจ็ดวัน",
    "label": {
      "th": "ประธานสภาแจ้งรายชื่อที่เลื่อนขึ้นมาแทน",
      "en": "The Speaker announces who moves up",
      "zh": "议长公告递补人选"
    },
    "value": {
      "th": "ภายใน 7 วัน",
      "en": "Within 7 days",
      "zh": "7天内"
    },
    "meaning": {
      "th": "เมื่อมีที่นั่งว่างจากสมาชิกแบบบัญชีรายชื่อ ประธานสภาผู้แทนราษฎรต้องประกาศในราชกิจจานุเบกษาภายในเจ็ดวันนับแต่วันที่ตำแหน่งนั้นว่างลง",
      "en": "When a party-list seat falls vacant, the Speaker must announce in the Royal Gazette, within 7 days, who moves up from the list.",
      "zh": "政党名单席位出缺时，议长须自缺位之日起七日内于皇家公报公告递补人选。"
    },
    "joke": {
      "th": "ที่นั่งบัญชีรายชื่อว่างลงวันนี้ ประกาศชื่อคนถัดไปในราชกิจจานุเบกษาต้องออกภายในเจ็ดวัน",
      "en": "A party-list seat empties today; the notice naming the next person on the list must be in the Gazette within seven days.",
      "zh": "名单席位今天出缺，点名下一位递补者的公告须在七日内刊入公报。"
    }
  },
  {
    "id": "senator-replace-60",
    "section": 107,
    "proof": "ภายในหกสิบวัน",
    "label": {
      "th": "เลือกสมาชิกวุฒิสภาขึ้นแทนที่ว่าง",
      "en": "Selecting replacement senators",
      "zh": "补选参议员"
    },
    "value": {
      "th": "ภายใน 60 วัน",
      "en": "Within 60 days",
      "zh": "60天内"
    },
    "meaning": {
      "th": "เมื่อสมาชิกวุฒิสภาเหลืออยู่ไม่ถึงกึ่งหนึ่งของจำนวนทั้งหมด ไม่มีรายชื่อสำรองเหลือ และอายุของวุฒิสภาเหลืออยู่เกินหนึ่งปี ให้ดำเนินการเลือกสมาชิกวุฒิสภาขึ้นแทนภายในหกสิบวันนับแต่วันที่เหลือไม่ถึงกึ่งหนึ่ง ผู้ได้รับเลือกอยู่ในตำแหน่งเพียงเท่าอายุที่เหลือของวุฒิสภา",
      "en": "When fewer than half of all Senators remain, no reserve list is left, and more than one year of the Senate's term remains, the selection of replacements must be carried out within 60 days of the day the Senate fell below half; they serve only the remaining term.",
      "zh": "参议员不足全体半数、已无备选名单且参议院任期尚余一年以上时，须自不足半数之日起六十日内进行补选，当选者仅任参议院剩余任期。"
    },
    "joke": {
      "th": "วุฒิสภามีสองร้อยโต๊ะ ถ้าคนนั่งไม่ถึงร้อยโต๊ะ รายชื่อสำรองก็หมด และวาระเหลือเกินหนึ่งปี ต้องเลือกคนมาเติมภายในหกสิบวัน",
      "en": "The Senate has two hundred desks. With fewer than one hundred occupied, no reserve names left, and more than a year to run, replacements must be chosen within sixty days.",
      "zh": "参议院有两百张桌子。坐人的不到一百张、备选名单用完、任期还剩一年以上时，六十天内必须选人补上。"
    }
  },
  {
    "id": "organic-bill-50",
    "section": 131,
    "proof": "จำนวนไม่น้อยกว่าหนึ่งในสิบของจำนวนสมาชิกทั้งหมด",
    "label": {
      "th": "สมาชิกสภาผู้แทนราษฎรเสนอร่างพระราชบัญญัติประกอบรัฐธรรมนูญ",
      "en": "MPs introducing an organic law bill",
      "zh": "议员提出组织法草案"
    },
    "value": {
      "th": "1/10 ของสมาชิก (500 คน = 50 คน)",
      "en": "One tenth of the members (50 of 500)",
      "zh": "议员的十分之一（500人中50人）"
    },
    "meaning": {
      "th": "ร่างพระราชบัญญัติประกอบรัฐธรรมนูญเสนอได้โดยสมาชิกสภาผู้แทนราษฎรจำนวนไม่น้อยกว่าหนึ่งในสิบของจำนวนสมาชิกทั้งหมดเท่าที่มีอยู่ หรือโดยคณะรัฐมนตรีตามข้อเสนอแนะของศาลฎีกา ศาลรัฐธรรมนูญ หรือองค์กรอิสระที่เกี่ยวข้อง",
      "en": "An organic law bill may be introduced by MPs numbering at least one tenth of all existing members, or by the Cabinet on the recommendation of the Supreme Court, the Constitutional Court or a relevant Independent Organ.",
      "zh": "组织法草案可由不少于现有众议员十分之一的议员提出，或由内阁依最高法院、宪法法院或相关独立机构的建议提出。"
    },
    "joke": {
      "th": "ห้าสิบลายเซ็นจากห้าร้อยคน คือหนึ่งในสิบ พอที่จะเสนอร่างกฎหมายประกอบรัฐธรรมนูญได้",
      "en": "Fifty signatures out of five hundred members make one tenth, enough to introduce an organic law bill.",
      "zh": "五百人中有五十人签名，正好十分之一，就够提出组织法草案了。"
    }
  },
  {
    "id": "organic-send-15",
    "section": 132,
    "proof": "ภายในสิบห้าวัน",
    "label": {
      "th": "รัฐสภาส่งร่างพระราชบัญญัติประกอบรัฐธรรมนูญให้ศาลหรือองค์กรอิสระให้ความเห็น",
      "en": "Parliament refers an organic law bill for opinions",
      "zh": "议会将组织法草案送交征求意见"
    },
    "value": {
      "th": "ส่งภายใน 15 วัน, ทักท้วงภายใน 10 วัน",
      "en": "Send within 15 days; objection window of 10 days",
      "zh": "15日内送交，10日内可提出异议"
    },
    "meaning": {
      "th": "ภายใน 15 วันนับแต่รัฐสภาให้ความเห็นชอบร่างพระราชบัญญัติประกอบรัฐธรรมนูญ ต้องส่งร่างนั้นให้ศาลฎีกา ศาลรัฐธรรมนูญ หรือองค์กรอิสระที่เกี่ยวข้องให้ความเห็น หากไม่มีข้อทักท้วงภายใน 10 วันนับแต่วันที่ได้รับร่าง รัฐสภาดำเนินการต่อไปได้",
      "en": "Within 15 days of approving an organic law bill, Parliament must refer it to the Supreme Court, the Constitutional Court or the relevant Independent Organ for opinions; if there is no objection within 10 days of receipt, Parliament proceeds.",
      "zh": "议会通过组织法草案后十五日内，须送交最高法院、宪法法院或相关独立机构征求意见；该机构自收到之日起十日内无异议的，议会继续后续程序。"
    },
    "joke": {
      "th": "รัฐสภามีสิบห้าวันที่จะส่งร่างไปให้ศาล ศาลมีสิบวันที่จะทักท้วง ถ้าศาลเงียบ ร่างก็เดินต่อ",
      "en": "Parliament has fifteen days to post the bill to the court; the court has ten days to object, and if it stays silent the bill moves on.",
      "zh": "议会有十五天把草案送去法院，法院有十天可以提出异议；若法院没有作声，草案就继续往下走。"
    }
  },
  {
    "id": "reconsider-180",
    "section": 138,
    "proof": "พ้นหนึ่งร้อยแปดสิบวัน",
    "label": {
      "th": "สภาผู้แทนราษฎรพิจารณาร่างที่วุฒิสภาไม่เห็นชอบซ้ำ",
      "en": "The House takes up a bill the Senate withheld",
      "zh": "参议院不通过的议案由众议院再议"
    },
    "value": {
      "th": "หลังพ้น 180 วัน, ด้วยคะแนนเสียงมากกว่ากึ่งหนึ่ง",
      "en": "After 180 days, by more than half of all existing MPs",
      "zh": "180天后，以现有议员过半数通过"
    },
    "meaning": {
      "th": "ร่างที่ถูกยับยั้งไว้ สภาผู้แทนราษฎรยกขึ้นพิจารณาใหม่ได้เมื่อพ้นหนึ่งร้อยแปดสิบวันนับแต่วันที่วุฒิสภาส่งร่างคืน หรือวันที่สภาใดสภาหนึ่งไม่เห็นชอบ (ร่างเกี่ยวด้วยการเงินลดเหลือสิบวัน) หากสภาผู้แทนราษฎรยืนยันด้วยคะแนนเสียงมากกว่ากึ่งหนึ่งของจำนวนสมาชิกทั้งหมดเท่าที่มีอยู่ ถือว่ารัฐสภาให้ความเห็นชอบ",
      "en": "A withheld bill may be taken up again by the House after 180 days from the day the Senate returns it or either House disapproves it (10 days for a money bill); if more than half of all existing MPs reaffirm it, it is deemed approved by Parliament.",
      "zh": "被搁置的议案，自参议院退回或任一院不通过之日起满一百八十天后（财政议案缩短为十天），众议院可再次审议；若获现有众议员过半数确认，视为议会已通过。"
    },
    "joke": {
      "th": "ร่างรออยู่หนึ่งร้อยแปดสิบวัน แล้วสภาผู้แทนราษฎรจึงยกขึ้นมาใหม่ได้ และต้องได้เสียงมากกว่ากึ่งหนึ่งของสมาชิกทั้งหมดเท่าที่มีอยู่",
      "en": "The bill waits one hundred and eighty days; then the House may take it up again, and it needs more than half of all its existing members.",
      "zh": "议案先等一百八十天，之后众议院才能重新审议，并须获全体现任众议员过半数。"
    }
  },
  {
    "id": "no-confidence-251",
    "section": 151,
    "proof": "มติไม่ไว้วางใจต้องมีคะแนนเสียงมากกว่ากึ่งหนึ่งของจำนวนสมาชิกทั้งหมด",
    "label": {
      "th": "มติไม่ไว้วางใจรัฐมนตรี",
      "en": "A no-confidence vote",
      "zh": "不信任案表决"
    },
    "value": {
      "th": "มากกว่ากึ่งหนึ่ง (500 คน = 251 เสียง)",
      "en": "More than half (251 of 500)",
      "zh": "过半数（500人中251票）"
    },
    "meaning": {
      "th": "มติไม่ไว้วางใจต้องมีคะแนนเสียงมากกว่ากึ่งหนึ่งของจำนวนสมาชิกทั้งหมดเท่าที่มีอยู่ของสภาผู้แทนราษฎร นับจากสมาชิกที่มีอยู่ทั้งหมด ไม่ใช่เฉพาะผู้ที่เข้าประชุมหรือลงคะแนน",
      "en": "A no-confidence motion needs more than half of ALL existing members of the House, counted from the whole House and not only from those present or voting.",
      "zh": "不信任案须获众议院全体在任议员过半数赞成，按全体在任议员计算，而非仅按出席或投票人数。"
    },
    "joke": {
      "th": "แมวต้องได้เสียงมากกว่ากึ่งหนึ่งของทุกโต๊ะในสภา แม้โต๊ะที่ว่างก็นับ ไม่ใช่แค่มือที่ยกขึ้น",
      "en": "The cat needs more than half of every desk in the House, empty ones included, not just the paws raised.",
      "zh": "猫要拿到众议院每一张桌子的过半数，空桌子也算，不是只数举起的爪子。"
    }
  },
  {
    "id": "pm-nominate-5",
    "section": 159,
    "proof": "ร้อยละห้า",
    "label": {
      "th": "พรรคเสนอชื่อนายกรัฐมนตรี",
      "en": "A party nominates a Prime Minister",
      "zh": "政党提名总理"
    },
    "value": {
      "th": "ไม่น้อยกว่าร้อยละ 5 ของสภา (500 คน = 25 คน)",
      "en": "At least 5% of the House (25 of 500)",
      "zh": "不少于众议院现有议员的5%（500人中25人）"
    },
    "meaning": {
      "th": "สภาผู้แทนราษฎรเห็นชอบนายกรัฐมนตรีได้เฉพาะจากบัญชีรายชื่อของพรรคที่มีสมาชิกได้รับเลือกไม่น้อยกว่าร้อยละห้าของจำนวนสมาชิกทั้งหมดเท่าที่มีอยู่ (สภา 500 คน คือ 25 คน) และการเสนอชื่อต้องมีสมาชิกรับรองไม่น้อยกว่าหนึ่งในสิบ",
      "en": "The House may approve a Prime Minister only from the lists of parties with elected MPs numbering at least 5% of all existing members (25 in a House of 500), and the nomination needs endorsement by at least one tenth of the members.",
      "zh": "众议院只能从当选议员不少于全体在任议员5%（500人时为25人）的政党名单中同意总理人选，且提名须有不少于十分之一议员联署支持。"
    },
    "joke": {
      "th": "ห้าร้อยที่นั่ง พรรคที่ได้อย่างน้อยยี่สิบห้าที่นั่ง หรือห้าในร้อย รายชื่อของพรรคนั้นจึงมีสิทธิถูกเสนอเป็นนายกรัฐมนตรี",
      "en": "Out of five hundred seats, a party holding at least twenty-five, five in every hundred, has a list that may put forward the Prime Minister.",
      "zh": "五百个席位中，政党至少拿到二十五席，也就是每一百席占五席，它的名单才有资格提出总理人选。"
    }
  },
  {
    "id": "war-two-thirds",
    "section": 177,
    "proof": "สองในสามของจำนวนสมาชิกทั้งหมด",
    "match": [
      "two-thirds",
      "two thirds",
      "2/3",
      "two-third"
    ],
    "label": {
      "th": "มติให้ความเห็นชอบประกาศสงคราม",
      "en": "The vote approving a declaration of war",
      "zh": "宣战同意票"
    },
    "value": {
      "th": "สองในสามของทั้งสองสภา (700 คน = 467 เสียง)",
      "en": "Two thirds of both Houses (467 of 700)",
      "zh": "两院合计三分之二（700人中467票）"
    },
    "meaning": {
      "th": "พระมหากษัตริย์ทรงไว้ซึ่งพระราชอำนาจในการประกาศสงคราม เมื่อได้รับความเห็นชอบของรัฐสภา มติให้ความเห็นชอบต้องมีคะแนนเสียงไม่น้อยกว่าสองในสามของจำนวนสมาชิกทั้งหมดเท่าที่มีอยู่ของทั้งสองสภา",
      "en": "The King's war power rests on Parliament's approval, which needs at least two thirds of all members of BOTH Houses combined.",
      "zh": "国王宣战权以议会同意为前提，须两院全体在任议员合计三分之二以上同意。"
    },
    "joke": {
      "th": "สองโต๊ะรวมกันแล้วต้องได้สองในสาม ไม่ใช่โต๊ะละสองในสาม",
      "en": "Two thirds of the two tables together, not two thirds of each table.",
      "zh": "是两张桌子合起来的三分之二，不是每张桌各自的三分之二。"
    }
  },
  {
    "id": "judge-under-68",
    "section": 201,
    "proof": "ไม่ถึงหกสิบแปดปี",
    "label": {
      "th": "อายุของตุลาการศาลรัฐธรรมนูญ",
      "en": "The age of a Constitutional Court judge",
      "zh": "宪法法院法官的年龄"
    },
    "value": {
      "th": "ไม่น้อยกว่า 45 ปี และไม่ถึง 68 ปี",
      "en": "At least 45 and under 68",
      "zh": "不小于45岁且未满68岁"
    },
    "meaning": {
      "th": "ตุลาการศาลรัฐธรรมนูญต้องมีอายุไม่ต่ำกว่าสี่สิบห้าปี แต่ไม่ถึงหกสิบแปดปี ในวันที่ได้รับการคัดเลือกหรือวันสมัครเข้ารับการสรรหา",
      "en": "A Constitutional Court judge must be at least 45 but under 68 on the day of selection or of applying to be selected.",
      "zh": "宪法法院法官在获遴选之日或报名参加遴选之日，须年满四十五岁而未满六十八岁。"
    },
    "joke": {
      "th": "ในวันที่ถูกคัดเลือก ต้องอายุครบสี่สิบห้าแล้ว และยังไม่ถึงหกสิบแปด หนึ่งวันก่อนครบหกสิบแปดยังได้ ครบหกสิบแปดแล้วไม่ได้",
      "en": "On the selection day the candidate must be at least forty-five and not yet sixty-eight: the day before the sixty-eighth birthday is fine, the birthday itself is too late.",
      "zh": "获选当天必须已满四十五岁且尚未满六十八岁：六十八岁生日的前一天可以，到了生日当天就太晚了。"
    }
  },
  {
    "id": "judge-retire-75",
    "section": 208,
    "proof": "มีอายุครบเจ็ดสิบห้าปี",
    "label": {
      "th": "ตุลาการศาลรัฐธรรมนูญพ้นจากตำแหน่งตามวาระ",
      "en": "A Constitutional Court judge leaves office at the age limit",
      "zh": "宪法法院法官到龄退休"
    },
    "value": {
      "th": "75 ปี",
      "en": "75",
      "zh": "75岁"
    },
    "meaning": {
      "th": "ตุลาการศาลรัฐธรรมนูญพ้นจากตำแหน่งเมื่อมีอายุครบเจ็ดสิบห้าปี",
      "en": "A Constitutional Court judge vacates office on reaching the age of 75.",
      "zh": "宪法法院法官年满七十五岁即卸任。"
    },
    "joke": {
      "th": "วันเกิดครบเจ็ดสิบห้าปีถูกวงสีแดงไว้ในปฏิทินศาล คือวันที่ตุลาการต้องลุกจากเก้าอี้",
      "en": "The seventy-fifth birthday is circled in red on the court calendar: the day the judge leaves the chair.",
      "zh": "法院日历上七十五岁生日被圈成红色，那一天法官就要离开座位。"
    }
  },
  {
    "id": "admin-court-7",
    "section": 211,
    "proof": "ไม่น้อยกว่าเจ็ดคน",
    "label": {
      "th": "ศาลรัฐธรรมนูญนั่งพิจารณาและวินิจฉัย",
      "en": "The Constitutional Court sitting and deciding",
      "zh": "宪法法院审理与裁决"
    },
    "value": {
      "th": "อย่างน้อย 7 คน",
      "en": "At least 7",
      "zh": "至少7人"
    },
    "meaning": {
      "th": "องค์คณะของตุลาการศาลรัฐธรรมนูญในการนั่งพิจารณาและในการทำคำวินิจฉัย ต้องมีตุลาการไม่น้อยกว่าเจ็ดคน",
      "en": "A panel of the Constitutional Court must have at least seven judges to hear a case and to decide it.",
      "zh": "宪法法院审理案件和作出裁决，合议庭须由不少于七名法官组成。"
    },
    "joke": {
      "th": "บนบัลลังก์มีป้ายชื่อตั้งไว้เจ็ดป้าย ถ้ามีตุลาการนั่งไม่ถึงเจ็ดคน ก็เปิดพิจารณาไม่ได้",
      "en": "Seven name cards stand on the bench; with fewer than seven judges in their seats, the hearing cannot open.",
      "zh": "法官席上摆着七张名牌，入座的法官不满七人，就不能开庭。"
    }
  },
  {
    "id": "organ-age-45-70",
    "section": 216,
    "proof": "มีอายุไม่ต่ำกว่าสี่สิบห้าปี แต่ไม่เกินเจ็ดสิบปี",
    "label": {
      "th": "คุณสมบัติของสมาชิกองค์กรอิสระ",
      "en": "The age qualification for members of independent organs",
      "zh": "独立机关成员的年龄资格"
    },
    "value": {
      "th": "ไม่น้อยกว่า 45 ปี และไม่เกิน 70 ปี",
      "en": "At least 45 and not over 70",
      "zh": "不小于45岁且不超过70岁"
    },
    "meaning": {
      "th": "สมาชิกขององค์กรอิสระต้องมีอายุไม่ต่ำกว่าสี่สิบห้าปี แต่ไม่เกินเจ็ดสิบปี ซึ่งต่างจากเกณฑ์ของตุลาการศาลรัฐธรรมนูญในมาตรา 201",
      "en": "A member of an independent organ must be at least 45 and not over 70, which differs from the Constitutional Court judge's age in section 201.",
      "zh": "独立机关成员须不小于四十五岁且不超过七十岁，与第二百零一条对宪法法院法官的年龄规定不同。"
    },
    "joke": {
      "th": "ที่นั่งเปิดรับตั้งแต่อายุสี่สิบห้าปี และต้องลุกให้คนอื่นเมื่อเกินเจ็ดสิบปี",
      "en": "The seat opens at forty-five and has to be given up once you are past seventy.",
      "zh": "座位四十五岁起开放，过了七十岁就得让给别人。"
    }
  },
  {
    "id": "ombudsman-20",
    "section": 228,
    "proof": "ประสบการณ์ในการดำเนินกิจการ อันเป็นสาธารณะมาแล้วไม่น้อยกว่ายี่สิบปี",
    "label": {
      "th": "ผู้ตรวจการแผ่นดินที่มีประสบการณ์ด้านสาธารณะ",
      "en": "The Ombudsman with public-service experience",
      "zh": "具公共服务经验的监察专员"
    },
    "value": {
      "th": "1 คน มีประสบการณ์ไม่น้อยกว่า 20 ปี",
      "en": "One, with at least 20 years' experience",
      "zh": "一人，经验不少于20年"
    },
    "meaning": {
      "th": "ผู้ตรวจการแผ่นดินสามคน ต้องมีผู้ที่เคยดำรงตำแหน่งไม่ต่ำกว่าอธิบดีหรือหัวหน้าส่วนราชการที่เทียบเท่าเป็นเวลาไม่น้อยกว่าห้าปีจำนวนสองคน และเป็นผู้มีประสบการณ์ในการดำเนินกิจการอันเป็นสาธารณะมาแล้วไม่น้อยกว่ายี่สิบปีจำนวนหนึ่งคน",
      "en": "Of the three Ombudsmen, two must have held a post at director-general level or equivalent for at least five years, and one must have at least 20 years' experience in conducting public-interest affairs.",
      "zh": "三名监察专员中，两人须担任司长（厅长）级或同等职位至少五年，一人须有至少二十年从事公共事务的经验。"
    },
    "joke": {
      "th": "โต๊ะสามตัว สองตัวนั่งมาแล้วห้าปี ตัวเดียวนั่งมาแล้วยี่สิบปี",
      "en": "Three desks: two with five years behind them, one with twenty.",
      "zh": "三张办公桌：两张已坐了五年，一张已坐了二十年。"
    }
  },
  {
    "id": "nacc-20",
    "section": 232,
    "proof": "อย่างสม่ำเสมอและต่อเนื่องมาเป็นเวลาไม่น้อยกว่ายี่สิบปี",
    "label": {
      "th": "ผู้สมัครเข้ารับการสรรหาตามวิชาชีพที่มีใบอนุญาต",
      "en": "NACC candidates admitted by licensed profession",
      "zh": "凭执业资格应征国家防止贪腐委员会委员者"
    },
    "value": {
      "th": "ประกอบวิชาชีพไม่น้อยกว่า 20 ปี",
      "en": "At least 20 years in the profession",
      "zh": "执业不少于20年"
    },
    "meaning": {
      "th": "ผู้ที่จะได้รับการสรรหาเป็นกรรมการป้องกันและปราบปรามการทุจริตตามข้อนี้ ต้องประกอบวิชาชีพที่มีกฎหมายรับรองอย่างสม่ำเสมอและต่อเนื่องมาไม่น้อยกว่ายี่สิบปี นับถึงวันที่ได้รับการเสนอชื่อหรือวันสมัครเข้ารับการสรรหา แล้วแต่กรณี และต้องได้รับการรับรองจากองค์กรวิชาชีพนั้น",
      "en": "A candidate for the NACC under this limb must have practised a legally recognised profession regularly and continuously for at least 20 years, counted to the date of nomination or of applying for selection, as the case may be, and be certified by the professional body.",
      "zh": "依此项应征国家防止贪腐委员会委员者，须经法律认可的职业连续、持续从业不少于二十年，自提名之日或申请参加遴选之日（视情形）起算，并获该职业组织认证。"
    },
    "joke": {
      "th": "สมุดบันทึกการทำงานต้องย้อนหลังครบยี่สิบปีโดยไม่ขาดตอน นับถึงวันที่ถูกเสนอชื่อ",
      "en": "The work logbook must reach back twenty years without a gap, counted to the day of nomination.",
      "zh": "执业记录簿必须不间断地往回翻满二十年，算到被提名那一天。"
    }
  },
  {
    "id": "nacc-petition-20000",
    "section": 236,
    "proof": "จำนวนไม่น้อยกว่าสองหมื่นคน",
    "label": {
      "th": "ผู้มีสิทธิร้องกล่าวหากรรมการป้องกันและปราบปรามการทุจริต",
      "en": "Petitions accusing an NACC commissioner",
      "zh": "指控国家防止贪腐委员会委员的联署"
    },
    "value": {
      "th": "อย่างน้อย 20,000 คน",
      "en": "At least 20,000 people",
      "zh": "至少2万人"
    },
    "meaning": {
      "th": "ผู้มีสิทธิเลือกตั้งไม่น้อยกว่าสองหมื่นคน (หรือสมาชิกของทั้งสองสภาไม่น้อยกว่าหนึ่งในห้าของจำนวนทั้งหมดเท่าที่มีอยู่) มีสิทธิเข้าชื่อกล่าวหาว่ากรรมการป้องกันและปราบปรามการทุจริตแห่งชาติผู้ใดกระทำการตามมาตรา 234 (1) โดยยื่นต่อประธานรัฐสภาพร้อมหลักฐานตามสมควร",
      "en": "At least 20,000 eligible voters (or at least one-fifth of all existing members of both houses) may sign an accusation that an NACC commissioner has done an act under section 234 (1), submitting it with reasonable evidence to the President of Parliament.",
      "zh": "不少于两万名有权选举者（或两院现有议员总数五分之一以上）得联署指控国家防止贪腐委员会某委员有第二百三十四条第（一）项所述行为，并附相当证据递交国会议长。"
    },
    "joke": {
      "th": "ใบร้องเรียนต้องมีลายชื่อครบสองหมื่นชื่อก่อนจะวางถึงโต๊ะประธานรัฐสภา",
      "en": "The petition sheet needs twenty thousand signatures before it reaches the President's desk.",
      "zh": "联署单要凑满两万个签名，才递得到议长的桌上。"
    }
  },
  {
    "id": "sac-appeal-90",
    "section": 240,
    "proof": "ภายในเก้าสิบวัน",
    "label": {
      "th": "อุทธรณ์คำสั่งลงโทษต่อศาลปกครองสูงสุด",
      "en": "Appealing an administrative penalty to the Supreme Administrative Court",
      "zh": "向最高行政法院上诉"
    },
    "value": {
      "th": "ภายใน 90 วัน",
      "en": "Within 90 days",
      "zh": "90天内"
    },
    "meaning": {
      "th": "ผู้ถูกสั่งลงโทษตามมาตรา 240 อาจอุทธรณ์ต่อศาลปกครองสูงสุดได้ภายในเก้าสิบวันนับแต่วันที่ได้รับคำสั่ง",
      "en": "A person ordered to pay a penalty under section 240 may appeal to the Supreme Administrative Court within 90 days of receiving the order.",
      "zh": "依第二百四十条被处罚者，可自收到命令之日起九十日内向最高行政法院提起上诉。"
    },
    "joke": {
      "th": "ประตูอุทธรณ์เปิดรอเก้าสิบวันนับจากวันที่คำสั่งมาถึงมือ แล้วก็ปิด",
      "en": "The appeal door stays open for ninety days from the day the order arrives, then it shuts.",
      "zh": "上诉的门自命令送达那天起开九十天，然后就关上。"
    }
  },
  {
    "id": "reform-law-120",
    "section": 259,
    "proof": "ภายในหนึ่งร้อยยี่สิบวัน",
    "label": {
      "th": "กฎหมายว่าด้วยแผนและขั้นตอนการปฏิรูปประเทศ",
      "en": "The law on national reform plans and procedures",
      "zh": "国家改革计划与程序法"
    },
    "value": {
      "th": "ภายใน 120 วัน",
      "en": "Within 120 days",
      "zh": "120天内"
    },
    "meaning": {
      "th": "ให้ดำเนินการตรากฎหมายว่าด้วยแผนและขั้นตอนการดำเนินการปฏิรูปประเทศ และประกาศใช้บังคับภายในหนึ่งร้อยยี่สิบวันนับแต่วันประกาศใช้รัฐธรรมนูญนี้",
      "en": "The law on national reform plans and procedures had to be enacted and in force within 120 days of the Constitution's promulgation.",
      "zh": "国家改革计划与程序法须在本宪法公布之日起一百二十日内制定并施行。"
    },
    "joke": {
      "th": "ปฏิทินติดผนังมีหนึ่งร้อยยี่สิบช่อง กฎหมายปฏิรูปต้องมีผลใช้บังคับก่อนขีดฆ่าช่องสุดท้าย",
      "en": "A wall calendar with one hundred and twenty squares: the reform law must be in force before the last one is crossed out.",
      "zh": "墙上的日历有一百二十格，划掉最后一格之前，改革法必须已经施行。"
    }
  },
  {
    "id": "education-60",
    "section": 261,
    "proof": "ภายในหกสิบวัน",
    "label": {
      "th": "คณะกรรมการด้านการศึกษาอิสระ",
      "en": "The independent education committee",
      "zh": "独立教育委员会"
    },
    "value": {
      "th": "แต่งตั้งภายใน 60 วัน",
      "en": "Appointed within 60 days",
      "zh": "60天内任命"
    },
    "meaning": {
      "th": "ให้คณะรัฐมนตรีแต่งตั้งคณะกรรมการด้านการศึกษาภายในหกสิบวันนับแต่วันประกาศใช้รัฐธรรมนูญ และให้คณะกรรมการนำเสนอร่างกฎหมายภายในสองปีนับแต่วันที่ได้รับการแต่งตั้ง",
      "en": "The Cabinet had to appoint the independent education committee within 60 days of promulgation, and the committee had to submit its draft laws within two years of appointment.",
      "zh": "内阁须在宪法公布之日起六十日内任命独立教育委员会，委员会须自受任之日起两年内提交法律草案。"
    },
    "joke": {
      "th": "นาฬิกาจับเวลาหกสิบวันเริ่มเดินเพื่อตั้งคณะกรรมการ เมื่อตั้งแล้วอีกเรือนหนึ่งเริ่มเดินสองปีเพื่อส่งร่างกฎหมาย",
      "en": "A sixty-day stopwatch starts for naming the committee; once it is named, a two-year one starts for handing in the draft laws.",
      "zh": "六十天的秒表为任命委员会开始走；任命之后，另一只两年的秒表为提交法律草案开始走。"
    }
  },
  {
    "id": "assembly-leave-90",
    "section": 263,
    "proof": "ภายในเก้าสิบวัน",
    "label": {
      "th": "ออกจากสภานิติบัญญัติแห่งชาติเพื่อลงสมัครรับเลือกตั้ง",
      "en": "Leaving the National Legislative Assembly to stand for election",
      "zh": "离开国民立法议会参选"
    },
    "value": {
      "th": "ภายใน 90 วัน",
      "en": "Within 90 days",
      "zh": "90天内"
    },
    "meaning": {
      "th": "สมาชิกสภานิติบัญญัติแห่งชาติจะสมัครรับเลือกตั้งเป็นสมาชิกสภาผู้แทนราษฎรในการเลือกตั้งทั่วไปครั้งแรกได้ ต้องพ้นจากตำแหน่งสมาชิกสภานิติบัญญัติแห่งชาติภายในเก้าสิบวันนับแต่วันประกาศใช้รัฐธรรมนูญนี้",
      "en": "A member of the National Legislative Assembly who wants to stand for the House of Representatives in the first general election must leave the Assembly within 90 days of the Constitution's promulgation.",
      "zh": "国民立法议会议员如欲在首次大选中参选下议员，须自宪法公布之日起九十日内卸任议员。"
    },
    "joke": {
      "th": "ประตูทางออกของห้องนี้มีนาฬิกาเก้าสิบวัน ออกช้ากว่านั้น ประตูก็ปิด",
      "en": "This room's exit door has a ninety-day clock. Leave later and it shuts.",
      "zh": "这屋子的出口门上有九十天的钟，走晚了门就关。"
    }
  },
  {
    "id": "assembly-deemed-60",
    "section": 267,
    "proof": "ภายในเวลาหกสิบวัน",
    "label": {
      "th": "สภานิติบัญญัติแห่งชาติพิจารณาร่างพระราชบัญญัติประกอบรัฐธรรมนูญ",
      "en": "The National Legislative Assembly considers a draft organic act",
      "zh": "国民立法议会审议组织法草案"
    },
    "value": {
      "th": "ภายใน 60 วัน",
      "en": "Within 60 days",
      "zh": "60天内"
    },
    "meaning": {
      "th": "สภานิติบัญญัติแห่งชาติต้องพิจารณาร่างพระราชบัญญัติประกอบรัฐธรรมนูญแต่ละฉบับให้เสร็จภายในหกสิบวันนับแต่วันที่ได้รับร่างจากคณะกรรมการร่างรัฐธรรมนูญ หากไม่เสร็จภายในเวลานั้น ให้ถือว่าเห็นชอบตามร่างที่คณะกรรมการเสนอ",
      "en": "The National Legislative Assembly must finish considering each draft organic act within 60 days of receiving it from the Drafting Commission; if it does not, it is deemed to approve the draft as the Commission proposed.",
      "zh": "国民立法议会须自收到制宪委员会所送每部组织法草案之日起六十日内审议完毕；逾期未完成的，视为按制宪委员会的提案通过。"
    },
    "joke": {
      "th": "นาฬิกาทรายที่โต๊ะทำงานเดินได้หกสิบวัน แล้วเอกสารจะถือว่าอนุมัติเอง",
      "en": "The hourglass on the desk runs sixty days, and after that the paper approves itself.",
      "zh": "桌上的沙漏走满六十天，文件就当自己被批准了。"
    }
  },
  {
    "id": "first-election-150",
    "section": 268,
    "proof": "ภายในหนึ่งร้อยห้าสิบวัน",
    "label": {
      "th": "การเลือกตั้งสมาชิกสภาผู้แทนราษฎรครั้งแรก",
      "en": "The first election of MPs under this Constitution",
      "zh": "本宪法下首次下议员选举"
    },
    "value": {
      "th": "ภายใน 150 วัน",
      "en": "Within 150 days",
      "zh": "150天内"
    },
    "meaning": {
      "th": "ให้ดำเนินการเลือกตั้งสมาชิกสภาผู้แทนราษฎรให้แล้วเสร็จภายในหนึ่งร้อยห้าสิบวันนับแต่วันที่พระราชบัญญัติประกอบรัฐธรรมนูญตามมาตรา 267 (1) (2) (3) และ (4) มีผลใช้บังคับ",
      "en": "The election of MPs had to be completed within 150 days of the organic acts under section 267 (1), (2), (3) and (4) coming into force.",
      "zh": "下议员选举须自第二百六十七条第（一）（二）（三）（四）项所列组织法生效之日起一百五十日内完成。"
    },
    "joke": {
      "th": "ป้ายนับถอยหลังหน้าหน่วยเลือกตั้งเขียนไว้ว่าหนึ่งร้อยห้าสิบวัน นับจากวันที่กฎหมายเลือกตั้งมีผลใช้บังคับ",
      "en": "The countdown board at the polling station reads one hundred and fifty days, counted from the day the election laws take effect.",
      "zh": "投票站的倒计时牌写着一百五十天，从选举相关组织法生效那天算起。"
    }
  },
  {
    "id": "first-senate-250",
    "section": 269,
    "proof": "สมาชิกจำนวนสองร้อยห้าสิบคน",
    "label": {
      "th": "วุฒิสภาชุดแรกตามมาตรา 269",
      "en": "The first Senate under section 269",
      "zh": "第二百六十九条项下的首届参议院"
    },
    "value": {
      "th": "250 คน",
      "en": "250 members",
      "zh": "250人"
    },
    "meaning": {
      "th": "วุฒิสภาชุดแรกตามมาตรา 269 ประกอบด้วยสมาชิกจำนวนสองร้อยห้าสิบคน ซึ่งพระมหากษัตริย์ทรงแต่งตั้งตามคำแนะนำของคณะรักษาความสงบแห่งชาติ เป็นชุดเฉพาะกาลอายุห้าปี",
      "en": "The first Senate under section 269 had 250 members appointed by the King on the NCPO's advice. It was a transitional body with a five-year term.",
      "zh": "第二百六十九条项下的首届参议院由国王依全国维持和平委员会建议任命，共二百五十人，属五年期的过渡机构。"
    },
    "joke": {
      "th": "โต๊ะสีน้ำเงินตั้งไว้สองร้อยห้าสิบที่นั่ง และเมื่อครบห้าปีทั้งโต๊ะก็ถูกเก็บไป",
      "en": "The blue table was set with two hundred and fifty seats, and after five years the whole table was cleared away.",
      "zh": "蓝桌摆了二百五十个座位，满五年后整张桌子都被撤走。"
    }
  },
  {
    "id": "ncpo-50",
    "section": 269,
    "proof": "ให้ได้จำนวนห้าสิบคน",
    "label": {
      "th": "คณะรักษาความสงบแห่งชาติคัดเลือกจากบัญชีรายชื่อของคณะกรรมการการเลือกตั้ง",
      "en": "The NCPO's pick from the Election Commission's list",
      "zh": "全国维持和平委员会从选委会名单中挑选"
    },
    "value": {
      "th": "50 คน (จากรายชื่อ 200 คน)",
      "en": "50 of the Commission's 200 names",
      "zh": "选委会200人名单中的50人"
    },
    "meaning": {
      "th": "คณะรักษาความสงบแห่งชาติคัดเลือกจากบัญชีรายชื่อที่คณะกรรมการการเลือกตั้งจัดให้มีจำนวนสองร้อยคน ให้ได้จำนวนห้าสิบคน และคัดเลือกรายชื่อสำรองอีกห้าสิบคน",
      "en": "From the 200 names produced by the Election Commission, the NCPO selected 50, with 50 reserves.",
      "zh": "从选委会提出的二百人名单中，全国维持和平委员会选出五十人，另备五十人。"
    },
    "joke": {
      "th": "รายชื่อสองร้อยคนบนโต๊ะ คัดได้ห้าสิบคน อีกห้าสิบคนเป็นสำรอง",
      "en": "Two hundred names on the table, fifty taken, fifty held in reserve.",
      "zh": "桌上两百个名字，取走五十个，另留五十个备用。"
    }
  },
  {
    "id": "spectrum-180",
    "section": 274,
    "proof": "ภายในหนึ่งร้อยแปดสิบวัน",
    "label": {
      "th": "แก้ไขกฎหมายคณะกรรมการกิจการกระจายเสียง",
      "en": "Amending the broadcasting regulator act",
      "zh": "修订广播监管机构法"
    },
    "value": {
      "th": "ภายใน 180 วัน",
      "en": "Within 180 days",
      "zh": "180天内"
    },
    "meaning": {
      "th": "ให้คณะรัฐมนตรีแก้ไขเพิ่มเติมพระราชบัญญัติองค์กรจัดสรรคลื่นความถี่และกำกับการประกอบกิจการวิทยุกระจายเสียง วิทยุโทรทัศน์ และกิจการโทรคมนาคม พ.ศ. 2553 ให้เป็นไปตามรัฐธรรมนูญนี้ และเสนอต่อสภานิติบัญญัติแห่งชาติเพื่อพิจารณาภายในหนึ่งร้อยแปดสิบวันนับแต่วันประกาศใช้รัฐธรรมนูญนี้",
      "en": "The Cabinet had to amend the 2010 Act on the frequency-allocation organization and the regulation of broadcasting and telecommunications to conform with this Constitution, and submit it to the National Legislative Assembly within 180 days of the Constitution's promulgation.",
      "zh": "内阁须自宪法公布之日起一百八十日内，修订二〇一〇年关于频率分配机构及广播、电视和电信监管的法，使之符合本宪法，并提交国民立法议会审议。"
    },
    "joke": {
      "th": "คลื่นความถี่วิ่งได้ไกลกว่านั้น แต่คณะรัฐมนตรีมีเวลาแค่หนึ่งร้อยแปดสิบวัน",
      "en": "The frequency runs further than that, but the Cabinet had a hundred and eighty days.",
      "zh": "频率跑得比那更远，内阁却只有一百八十天。"
    }
  },
  {
    "id": "strategy-120",
    "section": 275,
    "proof": "ภายในหนึ่งร้อยยี่สิบวัน",
    "label": {
      "th": "ยุทธศาสตร์ชาติ",
      "en": "The national strategy",
      "zh": "国家战略"
    },
    "value": {
      "th": "ภายใน 120 วัน",
      "en": "Within 120 days",
      "zh": "120天内"
    },
    "meaning": {
      "th": "ให้คณะรัฐมนตรีจัดให้มีกฎหมายว่าด้วยแผนยุทธศาสตร์ชาติให้แล้วเสร็จภายในหนึ่งร้อยยี่สิบวันนับแต่วันประกาศใช้รัฐธรรมนูญ และจัดทำยุทธศาสตร์ชาติให้แล้วเสร็จภายในหนึ่งปีนับแต่วันที่กฎหมายดังกล่าวใช้บังคับ",
      "en": "The national-strategy law had to be enacted within 120 days of promulgation, and the strategy itself completed within a year of that law taking effect.",
      "zh": "国家战略法须自宪法公布之日起一百二十日内制定，该法生效后一年内须完成国家战略。"
    },
    "joke": {
      "th": "บนกระดานเขียนไว้สองบรรทัด กฎหมายยุทธศาสตร์ชาติหนึ่งร้อยยี่สิบวัน ตัวยุทธศาสตร์อีกหนึ่งปีหลังจากนั้น",
      "en": "Two lines on the whiteboard: the strategy law, one hundred and twenty days; the strategy itself, one year after the law takes effect.",
      "zh": "白板上写着两行：国家战略法，一百二十天；国家战略本身，在该法生效后一年内。"
    }
  }
];
