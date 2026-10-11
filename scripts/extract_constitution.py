#!/usr/bin/env python3
"""Rebuild the citation-bearing corpus from primary-source PDFs. Requires PyMuPDF.
Downloads use curl (system TLS), never OCR or generated statutory text.
"""
import hashlib,json,re,subprocess,unicodedata
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
SOURCES={
 'th2017':('constitution-th-2017.pdf','https://www.senate.go.th/assets/portals/1/files/1%20(1)(1).PDF'),
 'th2021':('constitution-th-amended.pdf','https://intranet.senate.go.th/assets/portals/15/fileups/114/files/con2560edit4.pdf'),
 'en2017':('constitution-en-2017.pdf','https://www.opdc.go.th/wp-content/uploads/2024/05/CONSTITUTION.pdf')}
DIGITS=str.maketrans('๐๑๒๓๔๕๖๗๘๙','0123456789')
CHAPTERS=[(1,1,5,'บททั่วไป','General Provisions','总则'),(2,6,24,'พระมหากษัตริย์','The King','国王'),(3,25,49,'สิทธิและเสรีภาพของปวงชนชาวไทย','Rights and Liberties of the Thai People','泰国人民的权利与自由'),(4,50,50,'หน้าที่ของปวงชนชาวไทย','Duties of the Thai People','泰国人民的义务'),(5,51,63,'หน้าที่ของรัฐ','Duties of the State','国家的职责'),(6,64,78,'แนวนโยบายแห่งรัฐ','Directive Principles of State Policies','国家政策指导原则'),(7,79,157,'รัฐสภา','The National Assembly','国会'),(8,158,183,'คณะรัฐมนตรี','The Council of Ministers','内阁'),(9,184,187,'การขัดกันแห่งผลประโยชน์','Conflict of Interests','利益冲突'),(10,188,199,'ศาล','The Courts','法院'),(11,200,214,'ศาลรัฐธรรมนูญ','The Constitutional Court','宪法法院'),(12,215,247,'องค์กรอิสระ','Independent Organs','独立机构'),(13,248,248,'องค์กรอัยการ','State Attorney Organ','检察机关'),(14,249,254,'การปกครองส่วนท้องถิ่น','Local Administration','地方行政'),(15,255,256,'การแก้ไขเพิ่มเติมรัฐธรรมนูญ','Amendment to the Constitution','宪法修正'),(16,257,261,'การปฏิรูปประเทศ','National Reform','国家改革'),(17,262,279,'บทเฉพาะกาล','Transitory Provisions','过渡条款')]
def normalize(text,annotated=False):
 text=text.replace('\u00ad','').replace('\u200b','')
 # Thai PDF fonts encode SARA AM as NIKHAHIT + SARA AA; consolidated PDF also inserts a space.
 text=re.sub(r'([ก-ฮ])\s+า',r'\1ำ',text) if annotated else text
 text=re.sub(r'\u0e4d([\u0e48-\u0e4b]?)\u0e32',r'\1ำ',text)
 text=re.sub(r'\s+',' ',text).strip()
 return unicodedata.normalize('NFC',text)
def extract(key,lang):
 d=fitz.open(ROOT/'data/sources'/SOURCES[key][0]); chunks=[]; offsets=[];pos=0
 for i,p in enumerate(d):
  if lang=='th':
   # Gazette header occupies y<95; filter lines to retain whole body glyphs.
   lines=[]
   for b in p.get_text('dict')['blocks']:
    for line in b.get('lines',[]):
     if line['bbox'][1]>=95:lines.append(''.join(s['text'] for s in line['spans']))
   t='\n'.join(lines)
  else:t=p.get_text(clip=fitz.Rect(0,65,p.rect.width,790))
  offsets.append((pos,i+1));chunks.append(t+'\n');pos+=len(t)+1
 text=''.join(chunks)
 pattern=r'(?m)^\s*มาตรา\s+([๐-๙]+)\s+' if lang=='th' else r'(?m)^\s*Section\s+(\d+)\.\s*'
 matches=[]
 for candidate in re.finditer(pattern,text):
  if int(candidate.group(1).translate(DIGITS))==len(matches)+1:matches.append(candidate)
 assert len(matches)==279,(key,len(matches))
 out={}
 for j,m in enumerate(matches):
  n=int(m.group(1).translate(DIGITS));end=matches[j+1].start() if j+1<len(matches) else len(text)
  raw=text[m.end():end]
  boundary=r'(?m)^[ \t]*(?:(?:หมวด|ส่วนที่)[ \t]+[๐-๙]+[ \t]*$|บทเฉพาะกาล[ \t]*$|ผู้รับสนองพระ(?:บรม)?ราชโองการ)' if lang=='th' else r'(?m)^[ \t]*(?:CHAPTER[ \t]+\w+[ \t]*$|PART[ \t]+\w+[ \t]*$|TRANSITORY PROVISIONS[ \t]*$|Countersigned)'
  cut=re.search(boundary,raw)
  if cut:raw=raw[:cut.start()];end=m.end()+cut.start()
  pages=[p for ix,(off,p) in enumerate(offsets) if off<end and (offsets[ix+1][0] if ix+1<len(offsets) else len(text))>m.start()]
  out[n]={'text':normalize(raw),'pages':pages}
 assert sorted(out)==list(range(1,280))
 return out

def main():
 folder=ROOT/'data/sources';folder.mkdir(parents=True,exist_ok=True)
 for filename,url in SOURCES.values():
  path=folder/filename
  if not path.exists():subprocess.run(['curl','--fail','-L','--max-time','60',url,'-o',str(path)],check=True)
 th=extract('th2017','th');en=extract('en2017','en')
 consolidated=fitz.open(folder/SOURCES['th2021'][0])
 for n,page in [(83,40),(86,42),(91,44)]:
  numeral=str(n).translate(str.maketrans('0123456789','๐๑๒๓๔๕๖๗๘๙'))
  blocks=[b[4] for b in consolidated[page-1].get_text('blocks') if b[0]>122 and b[0]<126 and re.search('มาตรา '+numeral+r'\*',b[4])]
  assert len(blocks)==1,(n,blocks)
  raw=re.sub(r'^\s*มาตรา\s+[๐-๙]+\*\d+\s*','',blocks[0]);th[n]={'text':normalize(raw,True),'pages':[page]}
 sections=[]
 for n in range(1,280):
  chapter=next(c[0] for c in CHAPTERS if c[1]<=n<=c[2]);amended=n in (83,86,91)
  sections.append({'number':n,'chapter':chapter,'th':th[n]['text'],'en':en[n]['text'],'amended':amended,'englishStatus':'historical-2017-replaced-in-2021' if amended else 'government-translation-2017','source':{'th':{'url':SOURCES['th2021' if amended else 'th2017'][1],'pages':th[n]['pages']},'en':{'url':SOURCES['en2017'][1],'pages':en[n]['pages']}}})
 chapters=[{'number':n,'start':start,'end':end,'title':{'th':thai,'en':eng,'zh':zh},'transitory':n==17} for n,start,end,thai,eng,zh in CHAPTERS]
 meta={'title':'รัฐธรรมนูญแห่งราชอาณาจักรไทย พุทธศักราช 2560','sectionCount':279,'chapterCount':16,'amendment':'ฉบับที่ 1 พ.ศ. 2564','amendedSections':[83,86,91],'amendmentEffectiveDate':'2021-11-22','retrievedDate':'2026-10-12','status':'Thai corpus consolidated through the 2021 amendment; verify future changes against primary sources.','translationNote':'English is a government-published 2017 translation. Sections 83, 86 and 91 are historical English and must not be presented as current law. Thai authoritative text prevails. Chinese is a separate study aid.','extractionNote':'PDF extraction with whitespace and Thai SARA AM normalization; not a manually certified transcription. Source PDF pages are one-based.','sources':{k:{'url':url,'localFile':'data/sources/'+f,'sha256':hashlib.sha256((folder/f).read_bytes()).hexdigest()} for k,(f,url) in SOURCES.items()}}
 result={'meta':meta,'chapters':chapters,'sections':sections}
 (ROOT/'data/constitution.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print('Extracted 279 Thai and English sections; 16 chapters + transitory provisions; 2021 amendments 83, 86, 91.')
if __name__=='__main__':main()
