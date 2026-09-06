import test from 'node:test';
import assert from 'node:assert/strict';
import {setLanguage, t, hasKey, updateDocumentLanguage} from '../src/i18n/index.js';
import {mainScreen} from '../src/ui/screens/main.js';
import {creditsScreen} from '../src/ui/screens/credits.js';

test('the game title and browser title switch PL/EN without exposing Polish branding in English', tcase => {
 tcase.after(()=>setLanguage('pl'));
 assert.ok(hasKey('app.title'));
 assert.ok(hasKey('page.title'));
 for (const [locale,title] of [['pl','Ziemia Niczyja'],['en','No Man’s Land']]) {
  setLanguage(locale);
  const doc={title:'old',documentElement:{lang:''},querySelector:()=>null};
  updateDocumentLanguage(doc);
  assert.equal(t('app.title'),title);assert.ok(doc.title.includes(title));assert.equal(doc.documentElement.lang,locale);
  const main=mainScreen({checkpointState:'none'});
  assert.ok(main.includes(title));assert.ok(main.includes(locale==='en'?'logo-en.svg':'logo.svg'));
  assert.match(main,new RegExp(`lang="${locale}"`));
  if(locale==='en'){assert.doesNotMatch(main,/ZIEMIA|NICZYJA/i);assert.doesNotMatch(creditsScreen(),/Ziemia Niczyja/);}
 }
});
