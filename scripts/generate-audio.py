#!/usr/bin/env python3
"""Reproducible, resumable recorded readings using installed macOS voices.
Run --languages th,en first, then zh once full translations are complete.
No runtime API, credential, or browser voice is required to play the output.
"""
import argparse,concurrent.futures,hashlib,json,pathlib,subprocess,tempfile,time
ROOT=pathlib.Path(__file__).resolve().parents[1]
VOICES={'th':'Kanya (Thai (Thailand))','en':'Samantha (English (US))','zh':'Tingting (Chinese (China mainland))'}
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--languages',default='th,en,zh');ap.add_argument('--workers',type=int,default=2);args=ap.parse_args()
 corpus=json.loads((ROOT/'data/constitution.json').read_text())['sections'];amend=json.loads((ROOT/'data/translations/en-amendments.json').read_text());zh={}
 corrections=json.loads((ROOT/'data/translations/en-corrections.json').read_text());amend.update(corrections)
 for p in sorted((ROOT/'data/translations').glob('zh-*.json')):zh.update(json.loads(p.read_text()))
 jobs=[]
 for lang in args.languages.split(','):
  if lang not in VOICES:raise SystemExit('Unknown language '+lang)
  directory=ROOT/'public/audio'/lang;directory.mkdir(parents=True,exist_ok=True)
  for s in corpus:
   n=s['number'];source=s[lang] if lang=='th' else amend.get(str(n),{}).get('en',s['en']) if lang=='en' else zh.get(str(n),{}).get('zh')
   if not source:raise SystemExit(f'Missing full {lang} text for section {n}')
   introduction={'th':f'มาตรา {n}. ','en':f'Section {n}. ','zh':f'第{n}条。'}[lang]
   if lang=='en' and n in [83,86,91]:introduction+='Study translation of the 2021 amendment. Thai text prevails. '
   if lang=='en' and str(n) in corrections:introduction+='Study translation corrected against the Thai source. Thai text prevails. '
   if lang=='zh':introduction+='学习译文，以泰文原文为准。'
   if s['chapter']==17:introduction+={'th':'บทเฉพาะกาล โปรดตรวจเงื่อนไขเวลาในตัวบท. ','en':'Transitory provision. Check the time limits in the legal text. ','zh':'过渡条款，请核对原文规定的期限。'}[lang]
   text=introduction+source;digest=hashlib.sha256((VOICES[lang]+'|rate=175|'+text).encode()).hexdigest()
   path=directory/f'{n:03}.mp3';meta=directory/f'{n:03}.json';jobs.append((lang,n,text,digest,path,meta,s['source']['th']))
 def render(job):
  lang,n,text,digest,path,metadata,source=job
  if path.exists() and metadata.exists():
   previous=json.loads(metadata.read_text())
   if previous.get('bitRate')==40000 and previous.get('textSha256')==digest and previous.get('audioSha256')==hashlib.sha256(path.read_bytes()).hexdigest():return previous,True
  with tempfile.TemporaryDirectory(prefix='constitution-audio-') as tmp:
   work=pathlib.Path(tmp);(work/'speech.txt').write_text(text)
   subprocess.run(['say','-v',VOICES[lang],'-r','175','-f',str(work/'speech.txt'),'-o',str(work/'speech.aiff')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
   subprocess.run(['ffmpeg','-v','error','-y','-i',str(work/'speech.aiff'),'-ac','1','-ar','22050','-b:a','40k',str(work/'speech.mp3')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
   duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(work/'speech.mp3')]))
   if duration<=0:raise ValueError(f'Empty audio {lang}/{n}')
   data=(work/'speech.mp3').read_bytes();path.write_bytes(data)
  result={'section':n,'lang':lang,'url':f'/audio/{lang}/{n:03}.mp3','durationSeconds':round(duration,3),'bytes':len(data),'voice':VOICES[lang],'rate':175,'bitRate':40000,'textSha256':digest,'audioSha256':hashlib.sha256(data).hexdigest(),'source':source,'kind':'generated-recording','translation':lang=='zh' or (lang=='en' and str(n) in amend)}
  metadata.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');return result,False
 outputs=[];done=0;start=time.monotonic()
 with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
  for result,cached in executor.map(render,jobs):
   outputs.append(result);done+=1
   if done%25==0 or done==len(jobs):print(f'Audio {done}/{len(jobs)}; {time.monotonic()-start:.1f}s; latest {result["lang"]}/{result["section"]}'+(' reused' if cached else ''),flush=True)
 existing_path=ROOT/'data/audio-recordings.json';existing=json.loads(existing_path.read_text()) if existing_path.exists() else []
 merged={(r['lang'],r['section']):r for r in existing};merged.update({(r['lang'],r['section']):r for r in outputs})
 existing_path.write_text(json.dumps(sorted(merged.values(),key=lambda r:(r['lang'],r['section'])),ensure_ascii=False,indent=2)+'\n')
 print(f'Completed {len(outputs)} recordings',flush=True)
if __name__=='__main__':main()
