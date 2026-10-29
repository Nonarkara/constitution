// The handle for every rule the app teaches.
//
// `meaning` states the RULE the number decides — what the number is for, and
// what it is not. `joke` is the handle: one concrete image the learner can
// picture in the room the rule lives in, so the number has a place to hang.
//
// The house's cast is the house's own: the duck, the cat, the sparrow, the
// turtle with the oversized schoolbag, the owl with the binoculars the wrong
// way round. A room's picture is a locus; the handle names the object in it.
//
// Every id here must exist in data/facts.json or data/cram.json — the test
// in tests/rules.test.ts checks both directions, so a rule cannot drift out
// of the catalogue and a handle cannot drift out of the catalogue.
export const HANDLES = {
  "mps": {
    "meaning": {
      "th": "สมาชิกสภาผู้แทนราษฎรทั้งหมด 500 คน คือ มาจากการเลือกตั้งแบบแบ่งเขต 400 คน บวกแบบบัญชีรายชื่อ 100 คน",
      "en": "The House has 500 members in all: 400 elected by constituency plus 100 from party lists.",
      "zh": "众议院共500人：选区选举产生400人，加上政党名单100人。"
    },
    "joke": {
      "th": "โต๊ะสีชมพูมีสี่ร้อยที่นั่งสำหรับเขต และอีกหนึ่งร้อยที่นั่งสำหรับบัญชีรายชื่อ รวมห้าร้อยที่นั่ง",
      "en": "The pink table has four hundred seats for constituencies and one hundred more for party lists: five hundred seats in all.",
      "zh": "粉桌有四百个选区座位，另加一百个名单座位，一共五百个座位。"
    }
  },
  "senators": {
    "meaning": {
      "th": "วุฒิสภามีสมาชิก 200 คน ตามมาตรา 107 ส่วนวุฒิสภาชุดแรกตามมาตรา 269 มี 250 คน แต่เป็นชุดเฉพาะกาลที่สิ้นสุดแล้ว",
      "en": "The Senate has 200 members under section 107. The first Senate under section 269 had 250 and was a transitional body that has ended.",
      "zh": "参议院有200名议员（第一百零七条）。第二百六十九条的首届参议院为250人，属已结束的过渡机构。"
    },
    "joke": {
      "th": "โต๊ะที่สองมีสองร้อยที่นั่ง ไม่มีใครนับจากเก้าอี้ที่เห็น ให้นับจากมาตรา 107",
      "en": "The second table seats two hundred. Nobody counts the chairs on sight; count from section 107.",
      "zh": "第二张桌子坐两百人。别用眼睛数椅子，要数第一百零七条。"
    }
  },
  "house-term": {
    "meaning": {
      "th": "วาระของสภาผู้แทนราษฎรคือ 4 ปี นับแต่วันเลือกตั้ง",
      "en": "The House sits for a four-year term, counted from election day.",
      "zh": "众议院任期四年，自选举日起算。"
    },
    "joke": {
      "th": "นาฬิกาหน้าเดียวเดินสี่รอบ แล้วโต๊ะสีชมพูถูกเก็บกวาดและจัดใหม่",
      "en": "One clock, four turns. Then the pink table is swept and reset.",
      "zh": "一只钟走四圈，之后粉桌被清扫并重新布置。"
    }
  },
  "senate-term": {
    "meaning": {
      "th": "วาระของวุฒิสภาคือ 5 ปี นับแต่วันประกาศผลการเลือก และวุฒิสภาชุดแรกตามมาตรา 269 มีวาระ 5 ปีเช่นกัน",
      "en": "The Senate sits for a five-year term from the day the result of the selection is announced. The first Senate under section 269 also had five years.",
      "zh": "参议院任期五年，自公布选任结果之日起算；第二百六十九条的首届参议院同为五年。"
    },
    "joke": {
      "th": "โต๊ะสีน้ำเงินนั่งยาวกว่าโต๊ะสีชมพูหนึ่งรอบนาฬิกา คือห้าปี",
      "en": "The blue table sits one full turn of the clock longer than the pink one: five years.",
      "zh": "蓝桌比粉桌多坐钟的一整圈：五年。"
    }
  },
  "voting-age": {
    "meaning": {
      "th": "ผู้มีสิทธิเลือกตั้งต้องมีอายุไม่ต่ำกว่า 18 ปีในวันเลือกตั้ง",
      "en": "A voter must be at least 18 years old on election day.",
      "zh": "选民须在选举日年满18岁。"
    },
    "joke": {
      "th": "ประตูหน่วยเลือกตั้งมีป้ายอายุเขียนว่าสิบแปด ใครอายุครบสิบแปดภายในวันเลือกตั้งก็เดินเข้าได้",
      "en": "The polling-station door carries an age plate reading eighteen; anyone who has reached eighteen by election day walks in.",
      "zh": "投票站的门上挂着写有“十八岁”的牌子，选举日当天已满十八岁的人就能进去。"
    }
  },
  "mp-age": {
    "meaning": {
      "th": "ผู้มีคุณสมบัติสมัครเป็นสมาชิกสภาผู้แทนราษฎรต้องมีอายุไม่น้อยกว่า 25 ปี นับถึงวันเลือกตั้ง",
      "en": "A candidate for the House must be at least 25 years old as of election day.",
      "zh": "众议院议员候选人须至选举日年满二十五岁。"
    },
    "joke": {
      "th": "เป็ดตัวหนึ่งขีดวันเกิดไว้บนปฏิทินเลือกตั้ง ต้องมีอายุครบยี่สิบห้าปีภายในวันเลือกตั้งจึงลงสมัครได้",
      "en": "A duck ticks off its birthdays on the election calendar: it must have reached twenty-five by election day to stand.",
      "zh": "鸭子在选举日历上一年年划掉自己的生日：到选举日须满二十五岁才能参选。"
    }
  },
  "senator-age": {
    "meaning": {
      "th": "ผู้มีคุณสมบัติสมัครเป็นสมาชิกวุฒิสภาต้องมีอายุไม่น้อยกว่า 40 ปี ในวันสมัครรับเลือก",
      "en": "A candidate for the Senate must be at least 40 years old on the day of applying.",
      "zh": "参议员候选人须于报名当日年满四十岁。"
    },
    "joke": {
      "th": "โต๊ะสีน้ำเงินต้องมีอายุสี่สิบปีขึ้นไปในวันสมัคร มากกว่าโต๊ะสีชมพูที่ยี่สิบห้าปีอยู่สิบห้าปี",
      "en": "The blue table needs forty on the day of applying, fifteen years more than the pink table's twenty-five.",
      "zh": "蓝桌在报名当天须满四十岁，比粉桌的二十五岁多十五年。"
    }
  },
  "minister-age": {
    "meaning": {
      "th": "รัฐมนตรีต้องมีอายุไม่น้อยกว่า 35 ปี และไม่มีลักษณะต้องห้ามตามมาตรา 98 (ตามมาตรา 160 (6))",
      "en": "A minister must be at least 35 and must not fall under the prohibitions in section 98 (section 160(6)).",
      "zh": "部长须年满三十五岁，且不得有第九十八条所列的禁止情形（第一百六十条第（6）项）。"
    },
    "joke": {
      "th": "ประตูห้องประชุมคณะรัฐมนตรีมีป้ายเขียนว่าสามสิบห้า ผู้ที่อายุน้อยกว่านั้นรออยู่ข้างนอก",
      "en": "The cabinet-room door carries a plate reading thirty-five; anyone younger waits outside.",
      "zh": "内阁会议室门上的牌子写着三十五，不满三十五岁的人在门外等候。"
    }
  },
  "citizen-bill": {
    "meaning": {
      "th": "ผู้มีสิทธิเลือกตั้งจำนวนไม่น้อยกว่า 10,000 คน มีสิทธิเข้าชื่อเสนอร่างกฎหมายตามหมวด 3 (สิทธิและเสรีภาพของปวงชนชาวไทย) หรือหมวด 5 (หน้าที่ของรัฐ)",
      "en": "At least 10,000 eligible voters may sign a petition to introduce a bill under Chapter III (rights and liberties) or Chapter V (duties of the State).",
      "zh": "不少于一万名有权选举者得联署提出第三章（权利与自由）或第五章（国家的义务）项下的法律草案。"
    },
    "joke": {
      "th": "หนึ่งหมื่นปากกา หนึ่งชื่อต่อหนึ่งด้าม เก้าพันเก้าร้อยเก้าสิบเก้าชื่อยังขาดอีกหนึ่ง",
      "en": "Ten thousand pens, one name per pen; nine thousand nine hundred ninety-nine names is still one short.",
      "zh": "一万支笔，一人一名；九千九百九十九个名字还差一个。"
    }
  },
  "mp-bill": {
    "meaning": {
      "th": "สมาชิกสภาผู้แทนราษฎรจำนวนไม่น้อยกว่า 20 คน มีสิทธิเสนอร่างพระราชบัญญัติต่อสภาผู้แทนราษฎร",
      "en": "At least 20 MPs may introduce a draft bill to the House.",
      "zh": "不少于二十名下议员有权向众议院提出法律草案。"
    },
    "joke": {
      "th": "สองสิบคนยกมือขึ้นพร้อมกันที่โต๊ะสีชมพู คนที่ยี่สิบเอ็ดยังนั่งอยู่",
      "en": "Twenty hands go up together at the pink table. The twenty-first stays down.",
      "zh": "粉桌上二十只手一起举起，第二十一只没举。"
    }
  },
  "ministers": {
    "meaning": {
      "th": "รัฐมนตรีอื่นนอกจากนายกรัฐมนตรีมีได้ไม่เกิน 35 คน ไม่รวมตัวนายกรัฐมนตรี",
      "en": "Up to 35 other ministers, not counting the Prime Minister.",
      "zh": "其他部长不超过35人，不含总理本人。"
    },
    "joke": {
      "th": "กาน้ำชาหนึ่งใบเป็นของนายกรัฐมนตรี ส่วนโต๊ะคณะรัฐมนตรีวางถ้วยเพิ่มได้ไม่เกินสามสิบห้าใบ",
      "en": "One kettle for the Prime Minister, and the cabinet table sets at most thirty-five more cups.",
      "zh": "一把茶壶属于总理，内阁桌上最多再摆三十五只杯。"
    }
  },
  "pm-cap": {
    "meaning": {
      "th": "นายกรัฐมนตรีคนเดียวอยู่ในตำแหน่งรวมกันได้ไม่เกิน 8 ปี ไม่ว่าจะติดต่อกันหรือไม่ ช่วงรักษาการหลังพ้นตำแหน่งไม่นับ",
      "en": "One Prime Minister may hold office for eight years in total, consecutive or not; time serving after leaving office does not count.",
      "zh": "同一位总理累计任职不超过八年，不论是否连续；卸任后继续履职的时间不计入。"
    },
    "joke": {
      "th": "นาฬิกาหน้าเดียวเดินได้รวมกันไม่เกินแปดรอบ หยุดพักกลางทางก็ไม่ทำให้นับใหม่ และไม่มีรอบที่เก้า",
      "en": "One clock face may turn eight times in total, no ninth; pauses along the way do not reset the count.",
      "zh": "一个钟面累计最多转八圈，没有第九圈；中途停顿不会让计数归零。"
    }
  },
  "court-judges": {
    "meaning": {
      "th": "ศาลรัฐธรรมนูญมีตุลาการ 9 คน มาจากศาลฎีกา 3 คน ศาลปกครองสูงสุด 2 คน และผู้ทรงคุณวุฒิที่ได้รับการสรรหา 4 คน",
      "en": "The Constitutional Court has nine judges: three from the Supreme Court, two from the Supreme Administrative Court, and four qualified persons obtained by selection.",
      "zh": "宪法法院共九名法官：最高法院三名、最高行政法院两名，以及经遴选产生的四名合格人士。"
    },
    "joke": {
      "th": "เก้าอี้เรียงเป็นวง นั่งได้เก้าคนพอดี คนที่สิบไม่มีที่นั่ง",
      "en": "Nine chairs in a ring. Nine people fit; a tenth has no seat.",
      "zh": "九把椅子围成一圈，正好坐九个人，第十个人没有座位。"
    }
  },
  "court-term": {
    "meaning": {
      "th": "ตุลาการศาลรัฐธรรมนูญมีวาระ 7 ปี และดำรงตำแหน่งได้เพียงวาระเดียว",
      "en": "A Constitutional Court judge serves one seven-year term and no more.",
      "zh": "宪法法院法官任期七年，只任一届。"
    },
    "joke": {
      "th": "นาฬิกาทรายข้างเก้าอี้ใส่ทรายไว้เจ็ดปี ไหลหมดครั้งเดียวแล้วไม่พลิกกลับอีก",
      "en": "The hourglass beside the chair holds seven years of sand. It runs out once and is never turned over again.",
      "zh": "椅子旁的沙漏装着七年的沙，漏完一次，不再翻转。"
    }
  },
  "ec": {
    "meaning": {
      "th": "คณะกรรมการการเลือกตั้งมีกรรมการ 7 คน ซึ่งพระมหากษัตริย์ทรงแต่งตั้งตามคำแนะนำของวุฒิสภา",
      "en": "The Election Commission has seven members appointed by the King on the Senate's advice.",
      "zh": "选举委员会由七名委员组成，由国王依参议院建议任命。"
    },
    "joke": {
      "th": "ตู้ลงคะแนนเจ็ดตู้ ห้าตู้มาจากคณะกรรมการสรรหา สองตู้มาจากศาลฎีกา รวมเจ็ดตู้",
      "en": "Seven ballot boxes: five come from the selection committee and two from the Supreme Court, seven in all.",
      "zh": "七只票箱：五只来自遴选委员会，两只来自最高法院，一共七只。"
    }
  },
  "ombudsmen": {
    "meaning": {
      "th": "ผู้ตรวจการแผ่นดินมีจำนวน 3 คน ซึ่งพระมหากษัตริย์ทรงแต่งตั้งตามคำแนะนำของวุฒิสภา",
      "en": "The Ombudsmen number three, appointed by the King on the Senate's advice.",
      "zh": "监察专员共三人，由国王依参议院建议任命。"
    },
    "joke": {
      "th": "สามโต๊ะในสำนักงานเดียว โต๊ะละหนึ่งป้ายชื่อ ไม่มีโต๊ะที่สี่",
      "en": "Three desks in one office, one name plate on each; there is no fourth desk.",
      "zh": "一间办公室三张桌子，每张一块名牌，没有第四张桌子。"
    }
  },
  "nacc": {
    "meaning": {
      "th": "คณะกรรมการป้องกันและปราบปรามการทุจริตแห่งชาติมีกรรมการ 9 คน ซึ่งพระมหากษัตริย์ทรงแต่งตั้งตามคำแนะนำของวุฒิสภา",
      "en": "The NACC has nine commissioners, appointed by the King on the Senate's advice.",
      "zh": "国家防止贪腐委员会由九名委员组成，由国王依参议院建议任命。"
    },
    "joke": {
      "th": "ผู้ตรวจเก้าคนยืนเรียงแถวหน้าตู้เอกสารหนึ่งตู้ ทุกคนถือแว่นขยายคนละอัน รวมเป็นกรรมการเก้าคน",
      "en": "Nine inspectors line up at one filing cabinet, each holding a magnifying glass: nine commissioners.",
      "zh": "九名检查员排在一只文件柜前，各举一只放大镜：九名委员。"
    }
  },
  "nhrc": {
    "meaning": {
      "th": "คณะกรรมการสิทธิมนุษยชนแห่งชาติมีกรรมการ 7 คน มีวาระ 7 ปี และดำรงตำแหน่งได้เพียงวาระเดียว",
      "en": "The National Human Rights Commission has seven commissioners serving one seven-year term.",
      "zh": "国家人权委员会由七名委员组成，任期七年，只任一届。"
    },
    "joke": {
      "th": "ตะเกียงเจ็ดดวงอยู่ในห้องเดียว แต่ละดวงลุกได้เจ็ดปี ดับแล้วไม่จุดซ้ำ",
      "en": "Seven lamps in one room, each burning seven years; once a lamp goes out, it is not relit.",
      "zh": "一间屋里七盏灯，每盏燃七年，熄灭后不再点燃。"
    }
  },
  "amend-petition": {
    "meaning": {
      "th": "ประชาชนผู้มีสิทธิเลือกตั้งจำนวนไม่น้อยกว่า 50,000 คน มีสิทธิเข้าชื่อเสนอการแก้ไขเพิ่มเติมรัฐธรรมนูญตามมาตรา 256",
      "en": "At least 50,000 eligible voters may sign a proposal to amend the Constitution under section 256.",
      "zh": "不少于五万名有权选举者得依第二百五十六条联署提出宪法修正案。"
    },
    "joke": {
      "th": "ลายเซ็นอย่างน้อยห้าหมื่นชื่อ เป็นห้าเท่าของหนึ่งหมื่นชื่อที่ใช้เสนอร่างกฎหมายโดยประชาชน",
      "en": "At least fifty thousand signatures: five times the ten thousand that a citizens' bill needs.",
      "zh": "至少五万个签名，是公民提出法案所需一万个的五倍。"
    }
  },
  "school": {
    "meaning": {
      "th": "รัฐต้องทำให้เด็กทุกคนได้รับการศึกษาอย่างมีคุณภาพเป็นเวลา 12 ปี ตั้งแต่ก่อนวัยเรียนจนจบการศึกษาภาคบังคับ โดยไม่เก็บค่าใช้จ่าย",
      "en": "The State must provide twelve years of quality education from preschool through compulsory schooling, free of charge.",
      "zh": "国家须自学前至义务教育结束提供十二年不收费的优质教育。"
    },
    "joke": {
      "th": "บันไดหนังสือสิบสองขั้น เต่าขึ้นทีละขั้นและไม่มีขั้นที่ต้องจ่ายเงิน",
      "en": "A staircase of twelve books. The turtle climbs them one at a time, and no step asks for money.",
      "zh": "十二级书阶，乌龟一级一级爬，没有一级要钱。"
    }
  },
  "t-term-election": {
    "meaning": {
      "th": "เมื่ออายุของสภาผู้แทนราษฎรสิ้นสุดลง ต้องมีการเลือกตั้งทั่วไปภายใน 45 วันนับแต่วันที่สภาสิ้นอายุ โดยเป็นวันเดียวกันทั่วราชอาณาจักร",
      "en": "When the House's term ends, a general election must be held within 45 days of that date, on one and the same day nationwide.",
      "zh": "众议院任期届满时，须自届满之日起四十五日内举行大选，且全国同一天投票。"
    },
    "joke": {
      "th": "สภาผู้แทนราษฎรสิ้นอายุแล้ว ภายในสี่สิบห้าวันผู้ลงคะแนนต้องได้ยืนต่อแถวหน้าหีบบัตร",
      "en": "Once the House's term runs out, voters must be queuing at the ballot box within forty-five days.",
      "zh": "众议院任期一届满，四十五天内选民就得排到投票箱前。"
    }
  },
  "t-dissolve-election": {
    "meaning": {
      "th": "หลังยุบสภาผู้แทนราษฎร วันเลือกตั้งต้องไม่น้อยกว่า 45 วันแต่ไม่เกิน 60 วัน นับแต่วันที่พระราชกฤษฎีกายุบสภาใช้บังคับ (คณะกรรมการการเลือกตั้งประกาศวันเลือกตั้งภายใน 5 วันนับแต่วันนั้น)",
      "en": "After the House is dissolved, election day must fall no earlier than 45 and no later than 60 days after the dissolution decree takes effect (the Election Commission announces the date within 5 days of that).",
      "zh": "众议院解散后，选举日须在解散令生效之日起不少于四十五日、不超过六十日之间（选举委员会须在生效后五日内公布选举日）。"
    },
    "joke": {
      "th": "หน้าต่างเวลาสีชมพูเปิดระหว่างวันที่สี่สิบห้าถึงหกสิบวัน นอกเวลานั้นประตูปิด",
      "en": "The pink clock runs from day forty-five to day sixty. Outside that window, the door is shut.",
      "zh": "粉色的钟从第四十五天走到第六十天，出了这个窗口门就关着。"
    }
  },
  "t-first-sitting": {
    "meaning": {
      "th": "หลังประกาศผลการเลือกตั้งทั่วไป ต้องเรียกประชุมรัฐสภาครั้งแรกภายใน 15 วันนับแต่วันประกาศผล",
      "en": "After the general-election results are announced, Parliament must be convened for its first sitting within 15 days of the announcement.",
      "zh": "大选结果公布后，须自公布之日起十五日内召集国会举行首次会议。"
    },
    "joke": {
      "th": "เป็ดยืนรอใต้ป้ายประกาศผล กระดิ่งจะดังภายในสิบห้าวัน",
      "en": "The duck waits under the results board. The bell rings within fifteen days.",
      "zh": "鸭子在结果板下等着，十五天内铃响。"
    }
  },
  "t-session": {
    "meaning": {
      "th": "ปีหนึ่งมีสมัยประชุมสามัญของรัฐสภาสองสมัย สมัยละ 120 วัน ขยายเวลาได้ และปิดก่อนครบ 120 วันได้เมื่อรัฐสภาเห็นชอบ ถ้าการประชุมครั้งแรกมีเวลาถึงสิ้นปีปฏิทินไม่พอ อาจไม่มีสมัยที่สองในปีนั้นก็ได้",
      "en": "Parliament holds two ordinary sessions a year, each of 120 days. A session can be extended, and can close early only with Parliament's consent. If the first sitting leaves too little of the calendar year, the second session may be skipped that year.",
      "zh": "国会每年举行两期常会，每期一百二十日；可以延长，提前闭会须经国会同意。若首次会议后该历年所剩时间不足，该年可不举行第二期常会。"
    },
    "joke": {
      "th": "ปีหนึ่งมีสมุดสองเล่ม เล่มละหนึ่งร้อยยี่สิบหน้า เขียนวันละหนึ่งหน้า",
      "en": "Two notebooks a year, each with one hundred and twenty pages, one page per day.",
      "zh": "一年两本笔记本，每本一百二十页，一天写一页。"
    }
  },
  "t-policy": {
    "meaning": {
      "th": "คณะรัฐมนตรีต้องแถลงนโยบายต่อรัฐสภาภายใน 15 วันนับแต่วันเข้ารับหน้าที่ โดยไม่มีการลงมติความไว้วางใจ",
      "en": "The Cabinet must state its policy to Parliament within 15 days of taking office, without a confidence vote.",
      "zh": "内阁须自就任之日起十五日内向国会宣示政策，不付信任表决。"
    },
    "joke": {
      "th": "ชาในถ้วยยังอุ่นอยู่ แต่คณะรัฐมนตรีต้องขึ้นแถลงนโยบายภายในสิบห้าวันหลังเข้ารับหน้าที่",
      "en": "The tea in the cup is still warm, but the Cabinet must be at the podium within fifteen days of taking office.",
      "zh": "杯里的茶还温着，内阁就任后十五天内就得登台宣示政策。"
    }
  },
  "t-senate-bill": {
    "meaning": {
      "th": "วุฒิสภาต้องพิจารณาร่างพระราชบัญญัติที่สภาผู้แทนราษฎรเสนอมาให้เสร็จภายใน 60 วัน (ร่างเกี่ยวด้วยการเงิน 30 วัน) ขยายเป็นกรณีพิเศษได้ไม่เกิน 30 วัน นับเฉพาะวันในสมัยประชุมตั้งแต่วันที่ร่างมาถึง ถ้าไม่เสร็จให้ถือว่าเห็นชอบ",
      "en": "The Senate must finish considering a bill sent up by the House within 60 days (30 days for a money bill). It may extend this by up to 30 days as a special case. Only session days count, from the day the bill arrives, and if it does not finish in time it is deemed to approve.",
      "zh": "参议院须在六十日内审议完毕众议院送来的法案（财政法案为三十日）；可作特别延长，但不得超过三十日。仅计会期内的日子，自法案送达之日起算；逾期未完成的，视为同意。"
    },
    "joke": {
      "th": "โต๊ะสีน้ำเงินต้องรีบให้เสร็จในหกสิบวัน แต่ถ้าเป็นเรื่องเงิน มีสามสิบวัน",
      "en": "The blue table has sixty days to finish. If it is about money, thirty.",
      "zh": "蓝桌有六十天办完；若是钱的，三十天。"
    }
  },
  "t-budget": {
    "meaning": {
      "th": "สภาผู้แทนราษฎรต้องพิจารณาร่างพระราชบัญญัติงบประมาณให้แล้วเสร็จภายใน 105 วัน หากไม่เสร็จให้ถือว่าเห็นชอบ แล้วส่งต่อวุฒิสภา ซึ่งต้องเห็นชอบหรือไม่เห็นชอบภายใน 20 วัน โดยแก้ไขเพิ่มเติมไม่ได้",
      "en": "The House must finish the budget bill within 105 days, or it is deemed to approve it. The Senate then has 20 days to approve or reject it, with no amendments.",
      "zh": "众议院须在一百零五日内审议完毕预算法案，逾期视为同意；其后参议院须在二十日内表决同意或不同意，不得修改。"
    },
    "joke": {
      "th": "โต๊ะสีชมพูมีหนึ่งร้อยห้าวัน ส่วนโต๊ะสีน้ำเงินมียี่สิบวัน เพราะเงินไม่รอใคร",
      "en": "The pink table gets one hundred and five days; the blue one gets twenty. Money waits for no one.",
      "zh": "粉桌有一百零五天，蓝桌只有二十天。钱不等人。"
    }
  },
  "t-assent": {
    "meaning": {
      "th": "เมื่อรัฐสภาให้ความเห็นชอบร่างพระราชบัญญัติแล้ว นายกรัฐมนตรีต้องรอไว้ 5 วันนับแต่วันที่ได้รับร่างจากรัฐสภา (เว้นแต่มีกรณีตามมาตรา 148) แล้วนำขึ้นทูลเกล้าฯ ถวายภายใน 20 วันนับแต่วันพ้นกำหนด 5 วันนั้น",
      "en": "Once Parliament approves a bill, the PM must wait 5 days from receiving it (unless section 148 applies), then present it for royal assent within 20 days after that wait ends.",
      "zh": "国会通过法案后，总理须自收到法案之日起等候五日（第一百四十八条情形除外），再自五日期满之日起二十日内呈请国王签署。"
    },
    "joke": {
      "th": "เอกสารฉบับหนึ่งวางนิ่งบนโต๊ะห้าวัน แล้วมีเวลายี่สิบวันที่จะส่งออกไปจากโต๊ะ",
      "en": "A paper sits on a desk for five days, then has twenty days to leave it.",
      "zh": "一份文件在桌上放满五天，然后有二十天时间送出去。"
    }
  },
  "t-royal-return": {
    "meaning": {
      "th": "ถ้าพระมหากษัตริย์ไม่ทรงเห็นชอบและพระราชทานคืนมา หรือเมื่อพ้น 90 วันแล้วยังไม่พระราชทานคืนมา รัฐสภาต้องปรึกษาร่างนั้นใหม่",
      "en": "If the King withholds assent and returns the bill, or 90 days pass without it being returned, Parliament must reconsider the bill.",
      "zh": "国王不同意并将法案退回，或满九十日仍未发还的，国会须重新审议该法案。"
    },
    "joke": {
      "th": "ตั้งนาฬิกาจับเวลาไว้เก้าสิบวัน พอเสียงดัง ถ้าร่างยังไม่กลับมา รัฐสภาก็หยิบร่างขึ้นมาปรึกษาใหม่",
      "en": "A timer is set for ninety days. When it rings and the bill has not come back, Parliament picks the bill up and debates it again.",
      "zh": "计时器设定九十天。铃响时法案若还没回来，国会就把它重新拿起来审议。"
    }
  },
  "t-organic": {
    "meaning": {
      "th": "รัฐสภาประชุมร่วมกันพิจารณาร่างพระราชบัญญัติประกอบรัฐธรรมนูญให้เสร็จภายใน 180 วัน ถ้าไม่เสร็จในกำหนด ให้ถือว่ารัฐสภาเห็นชอบตามร่างที่เสนอ",
      "en": "Parliament, sitting jointly, must finish an organic bill within 180 days. If it does not finish in time, it is deemed to have approved the bill as proposed.",
      "zh": "国会须在一百八十日内联席审议完毕组织法草案。逾期未审议完的，视为国会已按所提草案同意。"
    },
    "joke": {
      "th": "โต๊ะยาวตัวเดียวนั่งได้ทั้งสองสภา ปฏิทินฉีกไปหนึ่งร้อยแปดสิบแผ่น ถ้าฉีกแผ่นสุดท้ายแล้วยังไม่ลงมติ ถือว่าเห็นชอบตามร่างที่เสนอ",
      "en": "One long table seats both Houses and a wall calendar is torn off for one hundred and eighty days. If the last page goes with no vote, the bill counts as approved as proposed.",
      "zh": "一张长桌坐下两院，墙上日历要撕一百八十页。最后一页撕完仍未表决，草案视为按所提内容通过。"
    }
  },
  "t-decree-court": {
    "meaning": {
      "th": "เมื่อสมาชิกสภาผู้แทนราษฎรหรือสมาชิกวุฒิสภาไม่น้อยกว่าหนึ่งในห้าของจำนวนสมาชิกทั้งหมดเท่าที่มีอยู่ของสภาตน เข้าชื่อเสนอว่าพระราชกำหนดไม่เป็นไปตามมาตรา 172 วรรคหนึ่ง ศาลรัฐธรรมนูญต้องวินิจฉัยภายใน 60 วันนับแต่วันที่ได้รับเรื่อง",
      "en": "When at least one fifth of all existing members of a House petition that an emergency decree does not meet section 172 paragraph one, the Constitutional Court must rule within 60 days of receiving the matter.",
      "zh": "众议院或参议院不少于本院全体在任议员五分之一的议员联名提出紧急法令不符合第172条第一款时，宪法法院须自收到案件之日起六十日内作出裁决。"
    },
    "joke": {
      "th": "ใบเข้าชื่อหนึ่งในห้าของสภาวางลงบนโต๊ะศาล นาฬิกาทรายหกสิบวันเริ่มไหล คำวินิจฉัยต้องมาก่อนทรายหมด",
      "en": "A petition signed by one fifth of a House lands on the Court's desk and a sixty-day sand timer starts. The ruling must come before the sand runs out.",
      "zh": "一院五分之一议员的联名书放到法院桌上，六十天的沙漏开始流动。裁决须赶在沙子漏完之前作出。"
    }
  },
  "t-amend-wait": {
    "meaning": {
      "th": "เมื่อพิจารณาวาระที่สองเสร็จแล้ว ต้องรอไว้ 15 วัน จึงพิจารณาวาระที่สามได้",
      "en": "After the second reading is finished, 15 days must be waited before the third reading.",
      "zh": "二读审议结束后，须等候十五日，才能进行三读。"
    },
    "joke": {
      "th": "ประตูห้องวาระสามติดป้ายว่า \"รอสิบห้าวัน\" นับจากวาระสองจบ จึงเปิดได้",
      "en": "A sign on the door of the third reading says wait fifteen days from the end of the second reading.",
      "zh": "三读那扇门上贴着告示：二读结束后，须等十五天。"
    }
  },
  "t-ombudsman-60": {
    "meaning": {
      "th": "ผู้ตรวจการแผ่นดินต้องพิจารณายื่นคำร้องต่อศาลพร้อมความเห็นภายใน 60 วันนับแต่วันที่รับคำร้อง ถ้าไม่ยื่นหรือไม่ยื่นภายในกำหนดนั้น ผู้ถูกละเมิดยื่นคำร้องโดยตรงต่อศาลได้",
      "en": "The Ombudsmen must consider referring the petition to the Court, with an opinion, within 60 days of receiving it. If they do not refer it, or not within that period, the person whose rights were violated may file directly with the Court.",
      "zh": "监察专员须在收到申诉之日起六十日内考虑将申诉连同意见移送宪法法院。不移送或逾期未移送的，权利受侵害者可直接向宪法法院提出申诉。"
    },
    "joke": {
      "th": "ตู้จดหมายของผู้ตรวจการแผ่นดินมีนาฬิกาทรายหกสิบวัน ทรายหมดแล้วจดหมายยังอยู่ ผู้เขียนถือไปศาลเองได้",
      "en": "The Ombudsmen's mailbox has a sixty-day sand timer. When the sand runs out and the letter is still inside, the writer may carry it to the Court personally.",
      "zh": "监察专员的信箱旁有只六十天的沙漏。沙漏漏完信还在，写信人就可以亲自把信送到法院。"
    }
  },
  "v-quorum": {
    "match": [
      "half",
      "one-half",
      "one half"
    ],
    "meaning": {
      "th": "ที่ประชุมของสภาผู้แทนราษฎรและวุฒิสภาต้องมีสมาชิกไม่น้อยกว่ากึ่งหนึ่งของจำนวนสมาชิกทั้งหมดเท่าที่มีอยู่ จึงจะถือว่าเป็นองค์ประชุม",
      "en": "A quorum is at least half of all existing members of the House or the Senate.",
      "zh": "众议院或参议院的法定人数为全体在任议员的半数以上。"
    },
    "joke": {
      "th": "ต้องมาครึ่งโต๊ะก่อนเริ่มนับเสียง อีกครึ่งโต๊ะที่ยังไม่มาก็เป็นเสียงที่ไม่ได้นับ",
      "en": "Half the table must be present before counting starts. The absent half is still an absent vote.",
      "zh": "开票前要坐满半桌。没来的那半桌，仍然是没投的票。"
    }
  },
  "v-noconf-file": {
    "match": [
      "1/5",
      "one-fifth",
      "one fifth",
      "a fifth"
    ],
    "meaning": {
      "th": "สมาชิกสภาผู้แทนราษฎรจำนวนไม่น้อยกว่าหนึ่งในห้าของจำนวนสมาชิกทั้งหมดเท่าที่มีอยู่ มีสิทธิเข้าชื่อเสนอญัตติขอเปิดอภิปรายเพื่อลงมติไม่ไว้วางใจรัฐมนตรี",
      "en": "At least one fifth of all existing MPs may file a no-confidence motion.",
      "zh": "不少于全体在任议员五分之一的议员有权提出不信任动议。"
    },
    "joke": {
      "th": "หนึ่งในห้าของโต๊ะสีชมพูยกมือก็พอ แต่คะแนนที่ผ่านต้องมากกว่าครึ่งโต๊ะ",
      "en": "One fifth of the pink table may raise a hand, but the motion needs more than half of it.",
      "zh": "粉桌五分之一的人可以举手，但动议要过半数。"
    }
  },
  "v-noconf-pass": {
    "match": [
      "half",
      "one-half",
      "one half"
    ],
    "meaning": {
      "th": "มติไม่ไว้วางใจต้องมีคะแนนเสียงมากกว่ากึ่งหนึ่งของจำนวนสมาชิกทั้งหมดเท่าที่มีอยู่",
      "en": "A no-confidence motion passes with more than half of all existing members.",
      "zh": "不信任案须以全体在任议员过半数通过。"
    },
    "joke": {
      "th": "ให้สมาชิกทุกคนที่ยังอยู่ยืนเรียงแถว ญัตติผ่านเมื่อมีมือยกมากกว่าครึ่งแถว ครึ่งแถวพอดียังไม่ผ่าน",
      "en": "Every sitting member stands in one line. The motion passes only when more than half of the whole line raises a hand; exactly half does not pass.",
      "zh": "在任议员全部排成一队。举手的人超过全队一半，动议才通过；刚好一半不算。"
    }
  },
  "v-pm-endorse": {
    "match": [
      "1/10",
      "one-tenth",
      "one tenth",
      "a tenth"
    ],
    "meaning": {
      "th": "การเสนอชื่อนายกรัฐมนตรีต้องได้รับการรับรองจากสมาชิกสภาผู้แทนราษฎรจำนวนไม่น้อยกว่าหนึ่งในสิบของจำนวนสมาชิกทั้งหมดเท่าที่มีอยู่",
      "en": "Endorsing a Prime Minister needs at least one tenth of all existing MPs.",
      "zh": "总理提名须有不少于全体在任议员十分之一联署。"
    },
    "joke": {
      "th": "สภามี 500 ที่นั่ง ใบเสนอชื่อนายกฯ ต้องมี 50 ลายเซ็น คือหนึ่งในสิบ 49 ยังขาด 50 ก็พอ",
      "en": "In a House of five hundred seats, the nomination sheet needs fifty signatures, one tenth. Forty-nine is short and fifty is enough.",
      "zh": "五百席的众议院，总理提名单要有五十个签名，即十分之一。四十九个不够，五十个就够。"
    }
  },
  "v-pm-approve": {
    "match": [
      "half",
      "one-half",
      "one half"
    ],
    "meaning": {
      "th": "สภาผู้แทนราษฎรต้องมีมติเห็นชอบบุคคลที่จะเป็นนายกรัฐมนตรีด้วยคะแนนเสียงมากกว่ากึ่งหนึ่งของจำนวนสมาชิกทั้งหมดเท่าที่มีอยู่ โดยลงคะแนนโดยเปิดเผย",
      "en": "The House must approve a Prime Minister with more than half of all existing members, in an open vote.",
      "zh": "众议院须以全体在任议员过半数、公开表决方式同意总理人选。"
    },
    "joke": {
      "th": "ลงคะแนนในห้องกระจกให้ทุกคนเห็น ชื่อนั้นผ่านเมื่อมีเสียงเห็นชอบมากกว่าครึ่งของสมาชิกทั้งหมดที่ยังอยู่ ครึ่งพอดียังอยู่นอกห้อง",
      "en": "The vote is cast in a glass room where everyone can see. The name goes through only with more than half of all sitting members behind it; exactly half stays outside.",
      "zh": "表决在玻璃房里进行，人人看得见。须有全体在任议员过半数赞成，这个名字才能通过；刚好一半，仍被挡在门外。"
    }
  },
  "v-amend-propose": {
    "match": [
      "1/5",
      "one-fifth",
      "one fifth",
      "a fifth"
    ],
    "meaning": {
      "th": "ญัตติขอแก้ไขรัฐธรรมนูญต้องมาจากคณะรัฐมนตรี หรือจาก ส.ส. ไม่น้อยกว่าหนึ่งในห้าของสมาชิกสภาผู้แทนราษฎรทั้งหมดเท่าที่มีอยู่ หรือจาก ส.ส. และ ส.ว. รวมกันไม่น้อยกว่าหนึ่งในห้าของสมาชิกทั้งสองสภาเท่าที่มีอยู่ หรือจากประชาชนผู้มีสิทธิเลือกตั้งไม่น้อยกว่า 50,000 คน",
      "en": "An amendment motion must come from the Cabinet; or from at least one fifth of all existing MPs; or from MPs and senators together numbering at least one fifth of all existing members of both Houses; or from at least 50,000 eligible voters.",
      "zh": "修宪动议须由内阁提出；或由不少于众议院全体在任议员五分之一的议员提出；或由众议院与参议院议员合计不少于两院全体在任议员五分之一提出；或由不少于五万名有选举权的公民提出。"
    },
    "joke": {
      "th": "ประตูยื่นญัตติมีกุญแจสี่ดอก: คณะรัฐมนตรี หนึ่งในห้าของสภาผู้แทน หนึ่งในห้าของสองสภารวมกัน และประชาชนห้าหมื่นคน",
      "en": "The motion door has four keys: the Cabinet, one fifth of the House, one fifth of both Houses together, and fifty thousand voters.",
      "zh": "提案之门有四把钥匙：内阁、众议院的五分之一、两院合计的五分之一，以及五万名选民。"
    }
  },
  "v-amend-first": {
    "match": [
      "half",
      "one-half",
      "one half",
      "1/3",
      "one-third",
      "one third",
      "a third"
    ],
    "meaning": {
      "th": "วาระที่หนึ่งขั้นรับหลักการต้องมีคะแนนเห็นชอบไม่น้อยกว่ากึ่งหนึ่งของสมาชิกทั้งหมดเท่าที่มีอยู่ของทั้งสองสภา ซึ่งต้องมี ส.ว. เห็นชอบไม่น้อยกว่าหนึ่งในสามของ ส.ว. ทั้งหมดเท่าที่มีอยู่",
      "en": "The first reading (approval in principle) needs votes in favour from at least half of all existing members of both Houses combined, including at least one third of all existing senators.",
      "zh": "第一次表决（原则性通过）须获两院全体在任议员合计不少于半数赞成，其中须有不少于全体在任参议员三分之一的参议员赞成。"
    },
    "joke": {
      "th": "ที่เคาน์เตอร์วาระหนึ่ง ต้องมีผู้ลงชื่อเห็นชอบอย่างน้อยครึ่งหนึ่งของสองสภารวมกัน และในนั้นต้องมี ส.ว. อย่างน้อยหนึ่งในสามของวุฒิสภา ครึ่งพอดีก็ใช้ได้",
      "en": "At the first-reading desk, at least half of both Houses together must sign in favour, and among them at least one third of the whole Senate. Exactly half is enough.",
      "zh": "一读的登记台前，两院合计至少一半议员签名赞成，其中至少要有参议院全体三分之一的参议员。刚好一半也算数。"
    }
  },
  "v-amend-third": {
    "match": [
      "half",
      "one-half",
      "one half",
      "1/3",
      "one-third",
      "one third",
      "a third",
      "20%",
      "20 percent",
      "20"
    ],
    "meaning": {
      "th": "วาระที่สามต้องมีคะแนนเห็นชอบมากกว่ากึ่งหนึ่งของสมาชิกทั้งหมดเท่าที่มีอยู่ของทั้งสองสภา ซึ่งต้องมี ส.ว. เห็นชอบไม่น้อยกว่าหนึ่งในสามของ ส.ว. ทั้งหมดเท่าที่มีอยู่ และมี ส.ส. จากพรรคที่สมาชิกไม่ดำรงตำแหน่งรัฐมนตรี ประธานสภาผู้แทนราษฎร หรือรองประธานสภาผู้แทนราษฎร เห็นชอบไม่น้อยกว่าร้อยละ 20 ของ ส.ส. ของทุกพรรคดังกล่าวรวมกัน",
      "en": "The third reading needs more than half of all existing members of both Houses, including at least one third of all existing senators, and at least 20% of the combined MPs of those parties whose members hold no post as minister, House Speaker or Deputy Speaker.",
      "zh": "第三次表决须获两院全体在任议员合计过半数赞成，其中须有不少于全体在任参议员三分之一的参议员赞成，并须有成员未担任部长、众议院议长或副议长的各党议员合计不少于百分之二十赞成。"
    },
    "joke": {
      "th": "ประตูสุดท้ายมีสามกุญแจ: มากกว่าครึ่งของสองสภา ส.ว. อย่างน้อยหนึ่งในสาม และอย่างน้อยร้อยละยี่สิบของ ส.ส. พรรคที่ไม่มีรัฐมนตรีหรือประธานหรือรองประธานสภา",
      "en": "The last gate has three locks: more than half of both Houses, at least one third of the senators, and at least a fifth of the MPs from parties with no minister, Speaker or Deputy Speaker.",
      "zh": "最后一道门有三把锁：两院过半数、参议员至少三分之一，以及没有部长、议长或副议长的各党议员至少五分之一。"
    }
  },
  "trap-ballots": {
    "joke": {
      "th": "เป็ดถือบัตรเลือกสองใบไว้ ถ้าเห็นบัตรใบเดียว แปลว่าเปิดหนังสือฉบับเก่า",
      "en": "The duck holds two ballots. One ballot in your hand means you are reading the old book.",
      "zh": "鸭子手里拿着两张选票。若只见一张，说明你翻的是旧书。"
    }
  },
  "trap-senate-250": {
    "joke": {
      "th": "ห้องหนึ่งมีเก้าอี้ที่แต่งตั้งไว้สองร้อยห้าสิบตัวเป็นเวลาห้าปี ครบห้าปีชุดนั้นออกไป ห้องเติมเก้าอี้ที่เลือกกันเองสองร้อยตัว",
      "en": "A room holds two hundred and fifty appointed chairs for five years. When the five years end, that set leaves and the room is refilled with two hundred chairs chosen from within.",
      "zh": "一间屋子摆着二百五十把委任的椅子，期限五年。五年一满，这一批撤走，屋里换上二百把自己选出来的椅子。"
    }
  },
  "trap-272": {
    "joke": {
      "th": "บัตรผ่านห้าปีให้ ส.ว. เข้าห้องโหวตนายกฯ ครบห้าปีบัตรใช้ไม่ได้ เหลือสภาผู้แทนฯ ลงคะแนนเอง",
      "en": "A five-year pass let senators into the PM vote room. After five years the pass is void and only the House votes.",
      "zh": "五年期通行证让参议员进入总理表决室。五年一到证件作废，只剩众议院自己投票。"
    }
  },
  "trap-duty-policy": {
    "joke": {
      "th": "ประตูหมวด 5 มีมือจับ ดึงได้ เขียนว่า \"ต้อง\" ประตูหมวด 6 เป็นภาพวาดบนกำแพง เขียนว่า \"พึง\"",
      "en": "The Chapter 5 door has a handle and can be pulled open; it reads must. The Chapter 6 door is painted on the wall; it reads should.",
      "zh": "第5章是带把手的门，写着“必须”，可以拉开。第6章是画在墙上的门，写着“应当”。"
    },
    "meaning": {
      "th": "หมวด 5 หน้าที่ของรัฐใช้คำว่า \"ต้อง\" และถ้าหน้าที่นั้นทำเพื่อประโยชน์แก่ประชาชนโดยตรง ประชาชนและชุมชนติดตาม เร่งรัด และฟ้องร้องได้ตามมาตรา 51 ตามหลักเกณฑ์ที่กฎหมายบัญญัติ ส่วนหมวด 6 แนวนโยบาย ใช้คำว่า \"พึง\" เป็นแนวทาง"
    }
  },
  "trap-pm-cap": {
    "joke": {
      "th": "มิเตอร์นับรวมทุกช่วงที่เป็นนายกฯ แม้เว้นช่วง ครบแปดปีมิเตอร์ตัด แต่เดือนที่รักษาการหลังพ้นตำแหน่งมิเตอร์ไม่เดิน",
      "en": "A meter adds up every stint as PM, gaps or not, and cuts off at eight years in total. Caretaker months after leaving office do not move the meter.",
      "zh": "电表把总理每一段任期都累加，中间有间隔也算，满八年就断电。卸任后看守的月份，电表不走。"
    }
  },
  "trap-court-term": {
    "joke": {
      "th": "เก้าอี้เก้าตัว ตัวละหนึ่งตั๋วเจ็ดปี ใช้ได้ครั้งเดียว ต่อไม่ได้",
      "en": "Nine chairs, each with one seven-year ticket. It is used once and cannot be renewed.",
      "zh": "九把椅子，每把配一张七年期的票。只能用一次，不能续期。"
    }
  },
  "trap-ombudsman-60": {
    "joke": {
      "th": "ตั๋วเข้าศาลมีอายุเก้าสิบวัน เริ่มนับเมื่อได้รับแจ้งความเห็นของผู้ตรวจการแผ่นดิน หรือเมื่อพ้นกำหนดโดยไม่ส่งเรื่อง เลยกำหนดแล้วใช้ไม่ได้",
      "en": "The ticket to the Court is valid for ninety days, counted from notice of the Ombudsmen's opinion or from the end of the period with no referral. Past that, it is void.",
      "zh": "进入法院的票有效期九十天，自收到监察专员意见通知之日，或移送期限届满而未移送之日起算。过期作废。"
    }
  }
};
