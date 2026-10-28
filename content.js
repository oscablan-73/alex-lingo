/* Alex-lingo · Motor local de preguntas. Sin dependencias ni servicios externos.
   Las variaciones se construyen a partir de reglas y ejemplos revisables. */
(function(){
'use strict';
const cards=[];const ids=new Set();
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function add(lang,level,topic,question,correct,wrong,explanation,translation='',instruction='Completa la frase con la opción correcta.'){
 const options=[String(correct),...wrong.map(String)];
 if(new Set(options.map(x=>x.trim().toLocaleLowerCase())).size!==4)return;
 const id='gen-'+hash([lang,level,topic,question,correct].join('|'));
 if(ids.has(id))return;ids.add(id);
 cards.push({id,lang,level,topic,question,options,correct:String(correct),explanation,translation,instruction,origin:'Generador integrado'});
}
const enBe=[['I','am'],['You','are'],['He','is'],['She','is'],['We','are'],['They','are']];
for(const [p,v] of enBe){for(const phrase of ['at home today','ready for the lesson','very happy today','in the classroom','from Spain','here now']){
 add('en','A1','Verbo to be',`${p} ___ ${phrase}.`,v,['am','is','are','be'].filter(x=>x!==v).slice(0,3),`En presente, «${p}» se combina con «${v}» del verbo to be.`,'','Elige la forma correcta de to be en presente.');
}}
const enHave=[['I','have'],['You','have'],['She','has'],['He','has'],['We','have'],['They','have']];
for(const [p,v] of enHave)for(const thing of ['a meeting every Monday','breakfast at seven every day','two classes on Fridays','a lesson every week']){
 add('en','A1','Have / has',`${p} ___ ${thing}.`,v,[v==='has'?'have':'has','having','haves'],`Con «${p}» en presente simple se utiliza «${v}». La tercera persona singular lleva has.`,'','Completa usando have/has en presente simple.');
}
const enPres=[['She','works','work'],['He','plays','play'],['My brother','studies','study'],['They','work','works'],['We','play','plays'],['My friends','study','studies']];
for(const [s,right,wrong] of enPres)for(const when of ['every morning','on Mondays','every week']){
 const natural=right.startsWith('stud')?'English':right.startsWith('play')?'tennis':'at the hospital';
 const base=right.endsWith('ies')?right.slice(0,-3)+'y':right.endsWith('s')?right.slice(0,-1):right;
 add('en','A1','Present simple',`${s} ___ ${natural} ${when}.`,right,[wrong,base+'ing','will '+base],`El present simple expresa hábitos. La forma correcta con «${s}» es «${right}».`,'','Usa el presente simple (sin futuro ni continuo).');
}
const enArticle=[['umbrella','an'],['apple','an'],['orange','an'],['elephant','an'],['hour','an'],['book','a'],['car','a'],['university','a'],['house','a'],['European city','a']];
for(const [noun,a] of enArticle)for(const prefix of ['She bought','I need','He wants']){
 add('en','A1','Artículos indefinidos',`${prefix} ___ ${noun}.`,a,[a==='a'?'an':'a','some','any'],`Se utiliza «${a}» porque se atiende al sonido inicial de «${noun}», no solo a su primera letra.`,'','Selecciona el artículo indefinido singular (a/an).');
}
const enPast=[['go','went','go','gone','goes','al cine'],['see','saw','see','seen','sees','ver'],['eat','ate','eat','eaten','eats','comer'],['write','wrote','write','written','writes','escribir'],['take','took','take','taken','takes','coger'],['buy','bought','buy','buyed','buys','comprar'],['come','came','come','comes','coming','venir'],['make','made','make','maked','makes','hacer']];
for(const [base,right,w1,w2,w3,tr] of enPast)for(const subject of ['I','She','They']){
 let object={go:'to the park',see:'a beautiful painting',eat:'lunch early',write:'a long email',take:'the train',buy:'a ticket',come:'home late',make:'a cake'}[base];
 add('en','A2','Past simple',`Yesterday, ${subject.toLowerCase()} ___ ${object}.`,right,[w1,w2,w3],`«${right}» es el pasado simple de «${base}». Yesterday exige aquí una acción terminada.`,'','Completa en pasado simple.');
}
const enPresentPerfect=[['finish','finished','finish','finishing','finishes'],['lose','lost','lose','losing','loses'],['write','written','wrote','writing','writes'],['break','broken','broke','breaking','breaks'],['eat','eaten','ate','eating','eats'],['see','seen','saw','seeing','sees']];
for(const [base,right,...wrong] of enPresentPerfect)for(const subj of ['I have','They have','She has']){
 const obj={finish:'the project',lose:'my keys',write:'three letters',break:'the glass',eat:'breakfast',see:'that film'}[base];
 add('en','A2','Present perfect',`${subj} ___ ${obj}.`,right,wrong,`Después de have/has se utiliza el participio pasado: «${base} → ${right}».`,'','Completa el present perfect.');
}
const enComparatives=[['fast','faster','more fast','fastest','most fast'],['small','smaller','more small','smallest','smalled'],['easy','easier','more easy','easiest','easyer'],['good','better','gooder','best','more good'],['bad','worse','badder','worst','more bad'],['expensive','more expensive','expensiver','most expensive','expensiveer']];
for(const [adj,right,...wrong] of enComparatives)for(const sub of ['This option','The second model']){
 add('en','A2','Comparativos',`${sub} is ___ than the first one.`,right,wrong,`El comparativo de «${adj}» es «${right}». El término than introduce la comparación.`,'','Selecciona la forma comparativa correcta.');
}
const enFuture=[['rain','we will stay at home','we stayed at home','we would stay at home','we staying at home'],['be sunny','we will go for a walk','we went for a walk','we would go for a walk','we going for a walk'],['finish early','we will have dinner together','we had dinner together','we would have dinner together','we having dinner together']];
for(const [condition,right,...wrong] of enFuture)for(const when of ['tomorrow','next weekend']){
 add('en','B1','First conditional',`If it ${condition==='rain'?'rains':condition==='be sunny'?'is sunny':'finishes early'} ${when}, ___.`,right,wrong,`El primer condicional utiliza if + present simple y will + infinitivo en la consecuencia.`,'','Elige el primer condicional correcto.');
}
const enSecond=[['had more time','travel more'],['knew the answer','tell you'],['lived near the sea','swim every day'],['had a car','drive to work'],['spoke French','work in Paris']];
for(const [condition,action] of enSecond)for(const person of ['I','We']){
 const subject=person==='I'?'I':'we';
 const right=`${subject} would ${action}`;
 add('en','B1','Second conditional',`If ${subject} ${condition}, ___.`,right,[`${subject} will ${action}`,`${subject} ${action}`,`${subject} had ${action}`],`El segundo condicional expresa una hipótesis: if + pasado simple, would + infinitivo.`,'','Completa el segundo condicional.');
}
const enRelative=[['The teacher','called me yesterday','who','which','where','when'],['The woman','lives upstairs','who','which','where','when'],['The book','is on the table','which','who','where','when'],['The phone','stopped working','which','who','where','when']];
for(const [person,rest,right,...wrong] of enRelative)for(const tail of (right==='who'?['is very friendly','is important to me']:['is important to me','has a story behind it'])){
 add('en','B1','Relative pronouns',`${person} ___ ${rest} ${tail}.`,right,wrong,`Se usa «${right}» para referirse a ${right==='who'?'personas':'cosas'}.`,'','Elige el pronombre relativo adecuado.');
}
const enPassive=[['Cars','made','make','making','makes'],['Letters','sent','send','sending','sends'],['Tickets','checked','check','checking','checks'],['Documents','signed','sign','signing','signs']];
for(const [noun,part,...wrong] of enPassive){
 add('en','B1','Voz pasiva',`${noun} ___ by the staff every day.`,`are ${part}`,[`are ${wrong[0]}`,`is ${part}`,`have ${part}`],`Pasiva de presente simple: am/is/are + participio. «${noun}» es plural, por eso are ${part}.`,'','Completa en voz pasiva presente.');
}
for(const [condition,action] of [['studied harder','passed the exam'],['left earlier','caught the train'],['called us','received help'],['saved more money','bought the tickets']]){
 add('en','B2','Third conditional',`If they had ${condition}, they ___ ${action}.`,'would have',['will have','would','had'],`La consecuencia del tercer condicional se construye con would have + participio.`,'','Selecciona el auxiliar del tercer condicional.');
}
for(const [sent,right,wrong,expl] of [
 ['Hardly ___ the train left when the storm began.','had',['has','did','was'],'Con hardly al inicio se invierte el orden auxiliar-sujeto: Hardly had the train left…'],
 ['Not only ___ she speak English, but she also speaks French.','does',['is','has','did'],'Not only al comienzo exige inversión en presente simple: does she speak.'],
 ['I wish I ___ more free time.','had',['have','will have','would have'],'Con wish, para expresar un deseo irreal presente, usamos pasado simple.'],
 ['He insisted on ___ the bill.','paying',['pay','paid','to pay'],'Después de la preposición on se usa la forma -ing.'],
 ['If I ___ known, I would have helped.','had',['have','would','was'],'El tercer condicional exige if + past perfect (had + participio).'],
 ['The meeting was called ___ because of the storm.','off',['out','up','away'],'Call off significa cancelar un evento.'],
 ['You should have ___ me earlier.','told',['tell','telling','tells'],'Should have + participio indica una recomendación o reproche en el pasado.'],
 ['By the time we arrived, the film ___ already started.','had',['has','was','did'],'Una acción anterior a otra acción pasada se expresa con past perfect.'],
 ['Despite ___ tired, she kept working.','being',['be','been','was'],'Después de despite se utiliza sustantivo o -ing, no una oración conjugada sin of the fact that.'],
 ['The report needs to ___ before Friday.','be finished',['finish','been finished','finishing'],'Después de needs to se utiliza el infinitivo pasivo: be + participio.']]){
 add('en','B2','Gramática avanzada',sent,right,wrong,expl);
}
// Francés
const frEtre=[['Je','suis'],['Tu','es'],['Il','est'],['Elle','est'],['Nous','sommes'],['Vous','êtes'],['Ils','sont'],['Elles','sont']];
for(const [p,v] of frEtre)for(const desc of ['ici aujourd’hui','à la maison','en vacances','dans la classe','à Paris']){
 const options=['suis','es','est','sommes','êtes','sont'].filter(x=>x!==v);
 add('fr','A1','Verbo être',`${p} ___ ${desc}.`,v,options.slice(0,3),`Presente de être: «${p} ${v}». Es una forma básica del verbo ser/estar.`,'','Selecciona la forma correcta de être.');
}
const frAvoir=[['J\'','ai'],['Tu ','as'],['Il ','a'],['Elle ','a'],['Nous ','avons'],['Vous ','avez'],['Ils ','ont']];
for(const [p,v] of frAvoir)for(const ob of ['un rendez-vous demain','un billet de train','une question importante','deux frères']){
 const wrong=['ai','as','a','avons','avez','ont'].filter(x=>x!==v).slice(0,3);
 add('fr','A1','Verbo avoir',`${p}___ ${ob}.`,v,wrong,`Presente de avoir: «${p.trim()}${v}». Se utiliza para expresar posesión y en tiempos compuestos.`,'','Completa con el presente de avoir.');
}
const frArticles=[['pain','du','de la','de l’','des'],['fromage','du','de la','des','de l’'],['viande','de la','du','des','de l’'],['soupe','de la','du','des','de l’'],['eau','de l’','du','de la','des'],['huile','de l’','du','de la','des'],['fraises','des','du','de la','de l’'],['pommes','des','du','de la','de l’']];
for(const [noun,right,...wrong] of frArticles)for(const v of ['Je voudrais','Nous achetons']){
 add('fr','A1','Artículos partitivos',`${v} ___ ${noun}.`,right,wrong,`En esta frase, «${right}» funciona como artículo partitivo o plural indefinido adecuado para «${noun}».`,'','Elige el artículo para indicar cantidad indeterminada.');
}
const frEr=[['parler','français','parle','parles','parlons','parlez'],['regarder','la télévision','regarde','regardes','regardons','regardez'],['travailler','ici','travaille','travailles','travaillons','travaillez'],['écouter','la radio','écoute','écoutes','écoutons','écoutez']];
for(const [verb,obj,j,t,n,v] of frEr){for(const [p,right,wrong] of [['Je',j,[t,n,v]],['Tu',t,[j,n,v]],['Nous',n,[j,t,v]],['Vous',v,[j,t,n]]]){
 add('fr','A1','Presente -er',`${p} ___ ${obj}.`,right,wrong,`El verbo «${verb}» es regular del primer grupo (-er). Con «${p}» termina en «${right.slice(-3)}».`,'','Conjuga en presente de indicativo.');
}}
const frPasse=[['regarder','regardé','regarder','regardais','regardera'],['manger','mangé','manger','mange','mangerai'],['visiter','visité','visiter','visitais','visiterai'],['écouter','écouté','écouter','écoutais','écouterai']];
for(const [verb,right,...wrong] of frPasse)for(const subj of ["J'ai","Nous avons","Ils ont"]){
 const obj={regarder:'un film',manger:'au restaurant',visiter:'le musée',écouter:'la radio'}[verb];
 add('fr','A2','Passé composé',`Hier, ${subj.toLowerCase()} ___ ${obj}.`,right,wrong,`Con avoir, el passé composé se forma con auxiliar + participio («${verb} → ${right}»).`,'','Completa el passé composé con avoir.');
}
for(const [subj,v,wrong] of [['Je','vais',['va','vas','vont']],['Tu','vas',['vais','va','allons']],['Il','va',['vais','vas','vont']],['Nous','allons',['allez','vont','va']],['Vous','allez',['allons','vont','vais']],['Ils','vont',['va','allez','allons']]]){
 for(const verb of ['manger','voyager','étudier','travailler']){
 add('fr','A2','Futur proche',`Demain, ${subj.toLowerCase()} ___ ${verb}.`,v,wrong,`El futuro próximo se construye con aller conjugado («${subj} ${v}») + infinitivo.`,'','Completa el futur proche.');
 }}
for(const [s,ans,wrong,expl] of [
 ['Je vois Marie. Je ___ vois tous les jours.','la',['le','lui','les'],'La sustituye al complemento directo femenino Marie.'],
 ['Je parle à Paul. Je ___ parle souvent.','lui',['le','la','les'],'Lui sustituye a un complemento indirecto singular introducido por à.'],
 ['Tu vas à Lyon ? Oui, j’___ vais.','y',['en','le','lui'],'Y sustituye a un complemento de lugar introducido por à.'],
 ['Tu veux du café ? Oui, j’___ veux.','en',['y','le','lui'],'En sustituye a una cantidad introducida por du/de la/des.'],
 ['Nous avons deux chats. Nous ___ avons deux.','en',['y','les','leur'],'En sustituye a un sustantivo cuantificado, conservando deux.'],
 ["Je ne mange ___ de viande.",'pas',['plusieurs','bien','beaucoup'],'La negación simple es ne… pas; de sustituye al artículo partitivo en negativo.']]){
 add('fr','A2','Pronombres y negación',s,ans,wrong,expl);
}
const frImp=[['aller','allais','vais','irai','suis allé','au parc'],['jouer','jouais','joue','jouerai','ai joué','avec mes amis'],['lire','lisais','lis','lirai','ai lu','le soir'],['faire','faisais','fais','ferai','ai fait','du sport']];
for(const [verb,right,...rest] of frImp){const [w1,w2,w3,obj]=rest;
 for(const pref of ['Quand j’étais petit, je','À cette époque, je']){
 add('fr','B1','Imparfait',`${pref} ___ souvent ${obj}.`,right,[w1,w2,w3],`«${right}» es el imperfecto de «${verb}». Describe una acción habitual o una situación pasada.`,'','Selecciona expresamente el imparfait.');
 }}
const frCond=[['voyager','voyagerais','voyagerai','voyage','ai voyagé'],['manger','mangerais','mangerai','mange','ai mangé'],['travailler','travaillerais','travaillerai','travaille','ai travaillé'],['étudier','étudierais','étudierai','étudie','ai étudié']];
for(const [verb,right,...wrong] of frCond)for(const ending of ['plus souvent','davantage']){
 add('fr','B1','Conditionnel',`Si j’avais le temps, je ___ ${ending}.`,right,wrong,`Para una hipótesis presente: si + imparfait, conditionnel présent («${right}»).`,'','Completa con el condicional.');
}
for(const [s,ans,wrong,expl] of [
 ["Le livre ___ j’ai lu est excellent.",'que',['qui','où','dont'],'Que es objeto directo de j’ai lu.'],
 ['La personne ___ arrive est ma sœur.','qui',['que','où','dont'],'Qui es sujeto del verbo arrive.'],
 ['La ville ___ je suis né est petite.','où',['que','qui','dont'],'Où designa el lugar donde ocurre la acción.'],
 ['Le sujet ___ nous parlons est complexe.','dont',['que','qui','où'],'Dont reemplaza el complemento de parler de.'],
 ['Il faut que tu ___ à l’heure.','sois',['es','seras','étais'],'Il faut que exige subjonctif: que tu sois.'],
 ['Je veux qu’il ___ heureux.','soit',['est','sera','était'],'Vouloir que expresa deseo y exige subjonctif: qu’il soit.'],
 ['Bien que nous ___ fatigués, nous continuons.','soyons',['sommes','serons','étions'],'Bien que introduce una subordinada en subjonctif: soyons.'],
 ['Elle souhaite que vous ___ le français.','parliez',['parlez','parlerez','parlions'],'Souhaiter que exige subjonctif: que vous parliez.']]){
 add('fr','B1','Relativos y subjuntivo',s,ans,wrong,expl);
}
for(const [s,ans,wrong,expl] of [
 ["Bien qu’il ___ tard, nous continuons.",'soit',['est','sera','était'],'Bien que rige subjonctif: bien qu’il soit tard.'],
 ["Il est essentiel que nous ___ prêts.",'soyons',['sommes','serons','étions'],'Il est essentiel que requiere subjonctif: soyons.'],
 ["Si j’avais su, je ___ venu.",'serais',['suis','sera','avais'],'Hipótesis irreal pasada: si + plus-que-parfait, conditionnel passé (serais venu).'],
 ["Elle est partie sans ___ au revoir.",'dire',['dit','disant','dis'],'Después de sans se puede usar infinitivo: sans dire au revoir.'],
 ["Il apprend le français en ___ tous les jours.",'pratiquant',['pratique','pratiqué','pratiquer'],'En + participe présent forma el gerundio: en pratiquant.'],
 ["Ce document doit ___ signé aujourd’hui.",'être',['est','été','ayant'],'La pasiva en infinitivo se forma con être + participe passé.'],
 ["Je doute qu’il ___ raison.",'ait',['a','aura','avait'],'Douter que normalmente exige subjonctif: qu’il ait raison.'],
 ["Pourvu qu’elle ___ à l’heure !",'arrive',['arrivera','arrivait','est arrivée'],'Pourvu que expresa deseo y exige subjonctif: qu’elle arrive.'],
 ["Quoiqu’il ___ très compétent, il reste prudent.",'soit',['est','sera','était'],'Quoique con sentido de aunque se usa con subjonctif: soit.'],
 ["Il aurait réussi s’il ___ davantage étudié.",'avait',['a','aurait','soit'],'Condición irreal pasada: si + plus-que-parfait; s’il avait étudié.'],
 ["Quand je suis arrivé, elle ___ déjà partie.",'était',['a','est','avait'],'El plus-que-parfait de partir se construye con être en imperfecto: était partie.'],
 ["Il faut que vous ___ ce formulaire.",'remplissiez',['remplissez','remplirez','remplissais'],'Il faut que exige subjonctif. Para vous: remplissiez.']]){
 add('fr','B2','Gramática avanzada',s,ans,wrong,expl);
}
// Variaciones de contexto que conservan una sola respuesta gramatical.
for(const [lang,level,topic,q,a,b,c,d,e] of [
 ['en','A2','Preposiciones','She is interested ___ learning French.','in','on','at','for','Interested in + verbo -ing.'],
 ['en','A2','Preposiciones','He is good ___ mathematics.','at','in','to','with','Good at es la construcción correcta para indicar habilidad.'],
 ['en','B1','Gerundio','I look forward to ___ you.','seeing','see','saw','seen','Look forward to va seguido de -ing (to es preposición).'],
 ['en','B2','Conectores','___ the bad weather, we went out.','Despite','Although','Because','However','Despite introduce un sintagma nominal; although requiere una oración.'],
 ['fr','A2','Preposiciones','Je vais ___ France.','en','au','à la','aux','Para países femeninos como France se usa en.'],
 ['fr','A2','Preposiciones','Il habite ___ Canada.','au','en','à la','aux','Para un país masculino singular como Canada se usa au.'],
 ['fr','B1','Conectores','Je reste à la maison ___ je suis malade.','parce que','bien que','pour que','afin que','Parce que introduce una causa y se utiliza con el indicativo.'],
 ['fr','B2','Conectores','Il parle doucement ___ personne ne l’entende.','pour que','parce que','alors que','depuis que','Pour que indica finalidad y rige subjonctif.']]){
 add(lang,level,topic,q,a,[b,c,d],e);
}

// Vocabulario combinatorio: la propia aplicación crea preguntas nuevas de traducción
// directa e inversa, con distractores contrastados del mismo grupo.
const vocabEN={
 A1:[['apple','manzana'],['bread','pan'],['water','agua'],['milk','leche'],['cheese','queso'],['egg','huevo'],['rice','arroz'],['meat','carne'],['fish','pescado'],['chair','silla'],['table','mesa'],['window','ventana'],['door','puerta'],['house','casa'],['street','calle'],['school','escuela'],['book','libro'],['pencil','lápiz'],['bag','bolsa'],['shoe','zapato'],['shirt','camisa'],['train','tren'],['bus','autobús'],['car','coche'],['airport','aeropuerto'],['station','estación'],['market','mercado'],['hospital','hospital'],['family','familia'],['brother','hermano'],['sister','hermana'],['mother','madre'],['father','padre'],['friend','amigo'],['dog','perro'],['cat','gato'],['bird','pájaro'],['tree','árbol'],['flower','flor'],['sun','sol'],['rain','lluvia'],['snow','nieve'],['summer','verano'],['winter','invierno'],['morning','mañana (parte del día)'],['night','noche'],['week','semana'],['month','mes'],['year','año'],['money','dinero']],
 A2:[['appointment','cita'],['journey','viaje'],['luggage','equipaje'],['neighbour','vecino'],['receipt','recibo'],['salary','sueldo'],['traffic','tráfico'],['traffic light','semáforo'],['crossroads','cruce'],['permission','permiso'],['advice','consejo'],['choice','elección'],['mistake','error'],['promise','promesa'],['holiday','vacaciones'],['weather','tiempo meteorológico'],['island','isla'],['mountain','montaña'],['valley','valle'],['forest','bosque'],['bridge','puente'],['building','edificio'],['ceiling','techo interior'],['floor','suelo'],['blanket','manta'],['suitcase','maleta'],['ticket','billete'],['schedule','horario'],['delay','retraso'],['crowd','multitud']]
};
const vocabFR={
 A1:[['bonjour','hola / buenos días'],['merci','gracias'],['pomme','manzana'],['pain','pan'],['eau','agua'],['lait','leche'],['fromage','queso'],['œuf','huevo'],['riz','arroz'],['poisson','pescado'],['chaise','silla'],['table','mesa'],['fenêtre','ventana'],['porte','puerta'],['maison','casa'],['rue','calle'],['école','escuela'],['livre','libro'],['stylo','bolígrafo'],['sac','bolsa'],['chaussure','zapato'],['chemise','camisa'],['train','tren'],['voiture','coche'],['aéroport','aeropuerto'],['gare','estación de tren'],['marché','mercado'],['hôpital','hospital'],['famille','familia'],['frère','hermano'],['sœur','hermana'],['mère','madre'],['père','padre'],['ami','amigo'],['chien','perro'],['chat','gato'],['oiseau','pájaro'],['arbre','árbol'],['fleur','flor'],['soleil','sol'],['pluie','lluvia'],['neige','nieve'],['été','verano'],['hiver','invierno'],['matin','mañana (parte del día)'],['nuit','noche'],['semaine','semana'],['mois','mes'],['année','año'],['argent','dinero']],
 A2:[['rendez-vous','cita'],['voyage','viaje'],['bagages','equipaje'],['voisin','vecino'],['reçu','recibo'],['salaire','sueldo'],['circulation','tráfico'],['feu rouge','semáforo en rojo'],['carrefour','cruce'],['autorisation','permiso'],['conseil','consejo'],['choix','elección'],['erreur','error'],['promesse','promesa'],['vacances','vacaciones'],['météo','previsión meteorológica'],['île','isla'],['montagne','montaña'],['vallée','valle'],['forêt','bosque'],['pont','puente'],['bâtiment','edificio'],['plafond','techo interior'],['sol','suelo'],['couverture','manta'],['valise','maleta'],['billet','billete'],['horaire','horario'],['retard','retraso'],['foule','multitud']]
};
for(const [lang,groups] of [['en',vocabEN],['fr',vocabFR]]){
 for(const [level,words] of Object.entries(groups)){
  for(let i=0;i<words.length;i++){
   const [foreign,spanish]=words[i];
   // 3 distractores alejados en el listado, no idénticos.
   let ix=[(i+7)%words.length,(i+17)%words.length,(i+29)%words.length];
   let wrong=ix.map(j=>words[j][1]);
   if(new Set([spanish,...wrong]).size!==4)continue;
   add(lang,level,'Vocabulario',`¿Qué significa «${foreign}» en español?`,spanish,wrong,`«${foreign}» se traduce como «${spanish}».`,'','Selecciona la traducción más adecuada.');
   wrong=ix.map(j=>words[j][0]);
   if(new Set([foreign,...wrong]).size!==4)continue;
   add(lang,level,'Vocabulario',`¿Cómo se dice «${spanish}» en ${lang==='en'?'inglés':'francés'}?`,foreign,wrong,`«${spanish}» se traduce como «${foreign}».`,'','Selecciona la palabra correcta.');
  }
 }
}
// Ampliación 2.0: bancos avanzados revisados manualmente para sesiones de 20 preguntas.
const advancedEN=[
 ['No sooner ___ we arrived than it started raining.','had',['have','did','were'],'Con no sooner al principio, el past perfect se invierte: No sooner had we arrived than…'],
 ['Only after the meeting ___ I understand the problem.','did',['had','was','have'],'Only after al inicio exige inversión del auxiliar: did I understand.'],
 ['Had I known about the delay, I ___ earlier.','would have left',['will leave','would leave','had left'],'Had I known equivale a If I had known; exige would have + participio.'],
 ['It is vital that she ___ on time.','be',['is','was','will be'],'El subjuntivo formal tras It is vital that utiliza be, sin -s.'],
 ['By next June, they ___ the project.','will have completed',['have completed','will completed','had completed'],'Future perfect: will have + participio; se completa antes de un punto futuro.'],
 ['She suggested ___ the appointment.','postponing',['postpone','to postpone','postponed'],'Suggest va seguido de un gerundio o de una subordinada; aquí corresponde postponing.'],
 ['We objected to ___ extra fees.','paying',['pay','paid','to pay'],'Object to + -ing: to es una preposición, no el marcador del infinitivo.'],
 ['I would rather you ___ me before changing the plan.','asked',['ask','will ask','asking'],'Would rather + sujeto distinto + pasado simple expresa una preferencia presente.'],
 ['The report is believed ___ accurate.','to be',['being','be','been'],'Construcción pasiva de opinión: is believed to be.'],
 ['If it hadn’t been for your help, I ___ the deadline.','would have missed',['will miss','would miss','missed'],'Condicional irreal pasado: would have missed.'],
 ['Under no circumstances ___ you reveal the password.','should',['you should','are','have'],'Un adverbial negativo al principio exige inversión: should you reveal.'],
 ['Not until midnight ___ the guests leave.','did',['had','were','have'],'Not until + expresión temporal anticipada lleva inversión del auxiliar en pasado.'],
 ['He denied ___ the confidential document.','having seen',['to see','saw','see'],'Deny va seguido de -ing; having seen enfatiza que la acción fue anterior.'],
 ['She is used to ___ early.','getting up',['get up','got up','be getting up'],'Be used to + nombre o gerundio; no se confunde con used to + infinitivo.'],
 ['I wish I ___ studied more for the exam.','had',['have','would','was'],'Wish sobre un arrepentimiento pasado: I wish I had + participio.'],
 ['It was ___ a difficult test that few students passed.','such',['so','too','very'],'Such + (a/an) + adjetivo + sustantivo; so + adjetivo sin sustantivo.'],
 ['He was made ___ the contract again.','to sign',['sign','signing','signed'],'La pasiva de make somebody do something requiere to-infinitive: was made to sign.'],
 ['She has been working here ___ 2018.','since',['for','during','from'],'Since introduce un punto de inicio concreto; for introduce duración.'],
 ['It is high time we ___ home.','went',['go','will go','going'],'It is high time + past simple expresa que ya deberíamos hacerlo.'],
 ['The train, ___ was delayed, finally arrived.','which',['who','whose','where'],'Cláusula relativa explicativa con referente cosa: which.'],
 ['Hardly ever ___ he complain about his job.','does',['is','has','did'],'Hardly ever al inicio con presente simple exige does he complain.'],
 ['If she were more careful, she ___ so many mistakes.','would not make',['will not make','did not make','had not made'],'Segundo condicional: if + pasado, would + infinitivo.'],
 ['He asked me where I ___ when I was a child.','lived',['do live','am living','will live'],'En estilo indirecto, una pregunta puede sufrir retroceso de tiempo: lived.'],
 ['She said she ___ the day before.','had arrived',['has arrived','arrives','will arrive'],'Past perfect en estilo indirecto para situar la llegada antes de lo dicho.'],
 ['Despite ___ late, the train was not cancelled.','being',['be','was','to be'],'Despite es preposición; admite -ing, no verbo conjugado directamente.'],
 ['There is little point in ___ about it now.','arguing',['argue','to argue','argued'],'There is little point in + verbo -ing.'],
 ['He was accused ___ stealing the documents.','of',['for','to','with'],'Accuse somebody of doing something.'],
 ['She succeeded ___ solving the issue.','in',['at','to','for'],'Succeed in + -ing: succeeded in solving.'],
 ['All the equipment ___ delivered yesterday.','was',['were','have','are'],'Equipment es un nombre incontable singular: was delivered.'],
 ['The sooner we leave, ___ we will arrive.','the earlier',['earlier','the earliest','more early'],'Comparativa correlativa: the sooner…, the earlier…']
];
for(const [q,c,w,e] of advancedEN)add('en','B2','Gramática avanzada ampliada',q,c,w,e,'','Selecciona la única respuesta gramaticalmente adecuada.');
const advancedFR=[
 ["Il faut que je ___ avant midi.",'parte',['pars','partirai','partais'],'Il faut que exige subjonctif: que je parte.'],
 ["Je ne crois pas qu’il ___ raison.",'ait',['a','aura','avait'],'Ne pas croire que expresa duda y suele exigir subjonctif: ait.'],
 ["Bien qu’elle ___ malade, elle travaille.",'soit',['est','sera','était'],'Bien que lleva subjonctif: qu’elle soit.'],
 ["Si nous avions pris le train, nous ___ à l’heure.",'serions arrivés',['sommes arrivés','arrivions','arriverons'],'Tercer tipo: si + plus-que-parfait, conditionnel passé; serions arrivés concuerda con nous.'],
 ["Avant que tu ne ___, appelle-moi.",'partes',['pars','partiras','partais'],'Avant que requiere subjonctif (ne explétif): tu partes.'],
 ["Il est possible qu’ils ___ demain.",'viennent',['viennent-ils','viendront','sont venus'],'Il est possible que introduce posibilidad y requiere subjonctif: viennent.'],
 ["Nous serions restés si nous ___ eu le temps.",'avions',['aurions','avons','ayons'],'Con si + plus-que-parfait: si nous avions eu.'],
 ["Elle m’a demandé si je ___ libre le lendemain.",'serais',['serai','suis','étais être'],'En estilo indirecto tras un pasado, el futuro se expresa como conditionnel: serais.'],
 ["Le rapport doit être ___ demain.",'remis',['remettre','remettant','remise'],'Passiva de devoir + être + participio: remis; rapport es masculino singular.'],
 ["Les lettres que j’ai ___ sont sur la table.",'écrites',['écrit','écrits','écrire'],'Con avoir, el participio concuerda con el COD anterior: les lettres que j’ai écrites.'],
 ["La maison dans ___ il habite est ancienne.",'laquelle',['lequel','lesquelles','duquel'],'Maison es femenino singular; después de dans se utiliza laquelle.'],
 ["Voici les raisons pour ___ elle refuse.",'lesquelles',['laquelle','lequel','dont'],'Raisons es femenino plural: pour lesquelles.'],
 ["Le projet ___ je t’ai parlé avance vite.",'dont',['que','qui','où'],'Parler de quelque chose: dont reemplaza de + complemento.'],
 ["C’est le livre auquel je ___.",'pense',['pensais-je','pensé','pensant'],'Penser à quelque chose, presente: auquel je pense.'],
 ["Je veux que nous ___ ce problème ensemble.",'résolvions',['résolvons','résoudrons','résoudre'],'Vouloir que exige subjonctif: que nous résolvions.'],
 ["Quoiqu’il ___ beaucoup, il reste modeste.",'sache',['sait','saura','savait'],'Quoique con valor concesivo exige subjonctif: sache.'],
 ["Il vaut mieux que tu ___ plus tôt.",'viennes',['viens','viendras','venais'],'Valoir mieux que expresa juicio/valoración y exige subjonctif: viennes.'],
 ["C’est à peine si elle ___ parler.",'peut',['puisse','pourrait-elle','pouvant'],'C’est à peine si introduce un hecho constatado: indicatif présent peut.'],
 ["Ils travaillent pour que tout ___ prêt.",'soit',['est','sera','était'],'Pour que expresa finalidad y requiere subjonctif: soit.'],
 ["Il est peu probable qu’elle ___ demain.",'revienne',['revient','reviendra','revenait'],'Peu probable que va con subjonctif: revienne.'],
 ["Je regrette qu’il ne ___ pas ici.",'soit',['est','sera','était'],'Regretter que expresa sentimiento y requiere subjonctif: soit.'],
 ["Nous avons attendu jusqu’à ce qu’il ___.",'arrive',['arrivera','est arrivé','arrivait'],'Jusqu’à ce que lleva subjonctif: arrive.'],
 ["Après qu’il ___ parti, nous avons fermé la porte.",'est',['soit','sera','était'],'En francés normativo, après que va con indicativo; passé composé: est parti.'],
 ["Elle préfère que tu ___ plus prudent.",'sois',['es','seras','étais'],'Préférer que exige subjonctif: sois.'],
 ["S’il faisait beau, nous ___ à la plage.",'irions',['allons','irons','sommes allés'],'Si + imparfait implica conditionnel présent: irions.'],
 ["Ce n’est pas le moment de ___ des décisions.",'prendre',['prenant','pris','prend'],'Tras ce n’est pas le moment de se emplea el infinitivo: prendre.'],
 ["La personne à ___ tu parles est mon amie.",'qui',['que','dont','lequel'],'Con personas, parler à qui es la construcción natural.'],
 ["Je doute qu’elles ___ terminé.",'aient',['ont','auront','avaient'],'Douter que exige subjonctif; subjonctif passé: aient terminé.'],
 ["Si j’étais toi, je ___ cette offre.",'refuserais',['refuserai','refusais','ai refusé'],'Condición irreal de presente: conditionnel présent refuserais.'],
 ["Ces décisions ont été ___ hier.",'prises',['pris','prendre','prenant'],'La pasiva con être concuerda con décisions, femenino plural: prises.']
];
for(const [q,c,w,e] of advancedFR)add('fr','B2','Gramática avanzada ampliada',q,c,w,e,'','Selecciona la única respuesta gramaticalmente adecuada.');

window.ALEXLINGO_CONTENT={cards,levels:['A1','A2','B1','B2'],hash};
})();
