import json,re,glob,os
os.chdir(os.path.join(os.path.dirname(__file__),'..'))
STOP=set('the a an and or to of in on at for with your you her his their my me we our is are be it that this then as by from them they him she he until while each every one take have has minutes minute'.split())
def toks(s):
    o=set()
    for t in re.sub(r'[^a-z0-9 ]+',' ',s.lower().replace('{a}','').replace('{b}','')).split():
        if len(t)<3 or t in STOP: continue
        t=re.sub(r'(ing|ed|es|s|ly)$','',t)
        if len(t)>=3:o.add(t)
    return o
def walk(x,out):
    if isinstance(x,str):
        if len(x)>14: out.append(x)
    elif isinstance(x,list): [walk(i,out) for i in x]
    elif isinstance(x,dict): [walk(v,out) for v in x.values()]
corpus=[]
for f in glob.glob('data/**/*.json',recursive=True):
    o=[];walk(json.load(open(f,encoding='utf-8')),o);corpus+=[toks(t) for t in o]
def dup(t):
    a=toks(t)
    if len(a)<2:return False
    for b in corpus:
        c=len(a&b)
        if c and max(c/(len(a)+len(b)-c), c/min(len(a),len(b))*0.85)>=0.62:return True
    return False
def rd(p):return json.load(open(p,encoding='utf-8'))
def wr(p,o):open(p,'w',encoding='utf-8').write(json.dumps(o,ensure_ascii=False,separators=(',',':')))
def keep(lst):
    out=[]
    for t in lst:
        if dup(t): print('  skip (similar exists):',t[:70]); continue
        out.append(t); corpus.append(toks(t))
    return out
JOURNAL={
'Everyday Touch':["Describe the last time a touch from your partner made you feel instantly calm. What exactly were they doing?","Which part of your body is most overlooked when you are being touched? How would you like it to be noticed?","Write about a hug that you still remember. What made it different?","What pace of touch do you want more of this month: slower, firmer, lighter or longer?","When do you most want to be held without it leading anywhere? Say so in one sentence to your partner.","Which kind of kiss do you miss most? Describe it in detail.","Write about the way your partner touches you when they are not trying to impress you. What do you love about it?","What would a ten minute touch date look like if no one was allowed to ask for more?"],
'Desire and Mood':["What are three things that reliably put you in the mood, in order of how quickly they work?","What switches your desire off fastest? Write it as a gentle request, not a complaint.","Do you want to be asked, surprised or invited? Explain what each feels like to you.","Describe a time you felt wanted without a single word being said.","What time of day do you feel most like yourself and most open to closeness?","What do you need to feel finished with the day before intimacy can begin?","Write about a moment this week when you thought of your partner and smiled. Tell them.","What fantasy of yours has more to do with how you feel than with what happens?"],
'After and Aftercare':["What do you most need in the first five minutes after sex or a scene: water, quiet, talk, touch or space?","Write about a time aftercare was done really well for you. What was the key moment?","What do you do for your partner after, and what would you like them to do for you?","How do you feel the day after an intense night? What helps you land softly?","Which words feel best to hear when you are open and a little raw?","What would a perfect fifteen minutes of cuddling look like for you?"],
}
j=rd('data/journal_prompts.json')
for t,l in JOURNAL.items():
    k=keep(l)
    if k: j.append({'t':t,'p':k})
wr('data/journal_prompts.json',j)
WYP=[["Be teased all evening with only looks and whispers","Have one long uninterrupted hour of kissing"],["Take a bath together by candlelight","Share a slow dance in the kitchen"],["Receive a full-body massage and say nothing","Give one and be told what to improve"],["Be blindfolded and surprised with touch","Be the one holding the blindfold and deciding"],["Have your partner write you a steamy letter","Hear a steamy voice note whenever you want"],["Wake up with slow kisses down your back","Wake up to a hot breakfast in bed and a whisper"],["Try a new position every week for a month","Perfect your favourite one until it is flawless"],["Be told exactly what your partner wants tonight","Be asked to guess it from clues"],["Spend a whole day naked at home together","Spend a whole day dressed up for a night out"],["Share one secret fantasy tonight","Have your partner guess it in three tries"],["Learn the eight Kama Sutra embraces","Learn the eight kinds of kisses"],["Have sex in the early morning light","Have sex late at night with the lights off"]]
w=rd('data/deck/wyp.json')
new=[x for x in WYP if not dup(x[0]+' '+x[1])]
w['cats'].append({'id':'sutra','l':'Slow & sensual','i':'🕯️','h':2,'n':len(new)}); w['items']['sutra']=new
wr('data/deck/wyp.json',w)
QA=[
{'q':'How do we make foreplay longer without it feeling forced?','s':'Foreplay gets longer when it has a purpose beyond getting started.','a':'1) Agree a rule: nothing below the waist for the first fifteen minutes. 2) Use a timer so neither of you has to watch the clock. 3) Rotate the focus: mouth and neck, hands and arms, back and thighs. 4) Whoever receives says "more", "slower" or "there" so the giver can learn. Script: "Let us take the long way tonight."','n':'If you are both anxious about performing, start with non-sexual touch for a week.','p':'desire'},
{'q':'What is a good way to ask for something new in bed?','s':'Ask when you are both relaxed, and ask for a try, not a promise.','a':'1) Choose a calm moment, not mid-act. 2) Start with what you love now. 3) Say "I have been curious about…" and name it in one sentence. 4) Offer a small first step. 5) Make it clear that no is welcome. Script: "I would love to try this once. If it does not work for you, we stop and that is fine."','n':'A yes, no, maybe list can make this easier if speaking feels hard.','p':'talk'},
{'q':'How do we recover after a night that went wrong?','s':'An awkward night is information, not failure.','a':'1) Do not analyse it straight away. 2) The next day, start with something kind. 3) Ask each other: what felt good, what did not, what would you change. 4) Pick one small change for next time. 5) Plan a low-pressure touch date soon so the memory is replaced by a good one.','n':'If this keeps happening, there may be a physical or emotional cause worth discussing with a professional.','p':'reconnect'},
{'q':'How can we keep things exciting after many years together?','s':'Novelty and anticipation do more than any single technique.','a':'1) Build anticipation: a message in the morning, a promise for later. 2) Change one thing at a time: place, time, pace, lighting. 3) Take turns planning the whole evening. 4) Use a game, a theme or a role-play to give permission to play. 5) Keep talking about what you want now, not what you wanted five years ago.','n':'','p':'desire'},
{'q':'How do we use a blindfold safely and comfortably?','s':'A blindfold adds trust, so agree on the rules first.','a':'1) Decide a safe word or a gesture, such as two taps. 2) Use a soft, light fabric that does not press on the eyes. 3) The wearer can always lift it. 4) Narrate the first touch so there are no startles. 5) Check in once partway through.','n':'','p':'kink'},
{'q':'How do we deal with being touched when we are ticklish or sensitive?','s':'Sensitivity is about speed and pressure, not about willingness.','a':'1) Say what you mean: too light, too sudden or too ticklish. 2) Ask for firmer, flatter, slower touch with a whole hand. 3) Start on less sensitive areas and approach slowly. 4) Move the hand away only when the receiver says so. 5) Treat ticklish spots as places to return to later.','n':'','p':'health'},
{'q':'How do we keep intimacy alive when we are apart for weeks?','s':'Distance works when contact is predictable and playful.','a':'1) Fix two regular calls. 2) Send a small surprise each day: a photo, a line, a voice note. 3) Plan one shared experience, such as watching the same film. 4) Share a fantasy in writing and save the other person\'s reply for later. 5) Plan the reunion in detail, from the first kiss to the first evening.','n':'','p':'ldr'},
{'q':'What if my partner falls asleep right after sex?','s':'It is usually the body relaxing, not a sign of low interest.','a':'1) Say how you feel, kindly: "I love cuddling for a few minutes after." 2) Agree five minutes of closeness before sleep. 3) Offer something to look forward to: tea, a shower or talk the next morning. 4) Remember that after orgasm many people feel sleepy.','n':'','p':'talk'},
]
have=rd('data/experts_qa.json'); add=[x for x in QA if not dup(x['q'])]
have+=add; wr('data/experts_qa.json',have)
print('journal+',sum(len(v) for v in JOURNAL.values()),'wyp',len(new),'qa',len(add))
