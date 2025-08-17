document.addEventListener("DOMContentLoaded", function(){

  // ==== صفحة اختيار اللعبة ====
  function showGame(game){
    document.getElementById('menu').style.display='none';
    if(game==='bingo') document.getElementById('bingoGame').style.display='block';
    if(game==='topten') document.getElementById('toptenGame').style.display='block';
  }

  // ربط أزرار الاختيار
  document.querySelectorAll('#menu button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      showGame(btn.getAttribute('data-game'));
    });
  });

  // ==== لعبة بينقو ====
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function createBingo() {
    const numbers = Array.from({length: 30}, (_, i) => i + 1);
    const shuffled = shuffle(numbers);
    const table = document.getElementById('bingoTable');
    table.innerHTML = '';
    let index=0;
    for(let row=0; row<6; row++){
      const tr=document.createElement('tr');
      for(let col=0; col<5; col++){
        const td=document.createElement('td');
        td.textContent=shuffled[index++];
        td.addEventListener('click',()=> td.classList.toggle('clicked'));
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  }
  createBingo();

  // ==== لعبة التوب تن ====
  const questionsData = [
    {question: "أكثر الأنبياء ذكرا في القرآن", answers:[["موسى"],["ابراهيم"],["نوح"],["يوسف"],["لوط"],["ادم"],["عيسى"],["هارون"],["سليمان"],["اسحاق"]]},
    {question: "أقوى جوازات سفر في العالم", answers:[["سنغافورة"], ["اليابان","كوريا الجنوبية"], ["الدنمارك","فلندا","فرنسا","ألمانيا","إيطاليا","إسبانيا","أيرلندا"], ["النمسا","بلجيكا","لوكسمبورغ","هولندا","النرويج","السويد"], ["اليونان","نيوزيلندا","سويسرا"], ["بريطانيا"], ["أستراليا","التشيك","المجر","مالطا","بولندا"], ["كندا","استونيا","الإمارات"], ["كرواتيا","سلوفاكيا"], ["أيسلندا","أمريكا"]]},
    {question:"أكثر المنتخبات تحقيقًا للمداليات الذهبية في الأولمبياد", answers:[["أمريكا"], ["روسيا"], ["بريطانيا"], ["الصين"], ["ألمانيا"], ["فرنسا"], ["إيطاليا"], ["اليابان"], ["المجر"], ["أستراليا"]]},
    {question:"أكبر العواصم العربية من ناحية عدد السكان", answers:[["القاهرة"], ["بغداد"], ["الرياض"], ["الخرطوم"], ["صنعاء"], ["الكويت"], ["الجزائر"], ["تونس"], ["دمشق"], ["بيروت"]]},
    {question:"أكثر تطبيقات التواصل الاجتماعي استخدامًا في السعودية", answers:[["واتساب"], ["يوتيوب"], ["سناب شات"], ["تيك توك"], ["انستقرام"], ["تويتر"], ["تيليجرام"], ["فيس بوك"], ["لينكدان"]]}
  ];

  const startBtn = document.getElementById("startBtn");
  const submitBtn = document.getElementById("submitBtn");
  const finishBtn = document.getElementById("finishBtn");
  const questionsContainer = document.getElementById("questionsContainer");
  const resultsDiv = document.getElementById("results");
  const scoreP = document.getElementById("score");
  const timeTakenP = document.getElementById("timeTaken");
  const timerP = document.getElementById("timer");

  let timer;
  let timeLeft = 300;
  let startTime;
  let totalScore = 0;
  let centersUsed = questionsData.map(()=>[]);

  startBtn.addEventListener("click", ()=>{
    startBtn.style.display="none";
    questionsContainer.style.display="block";
    submitBtn.style.display="inline-block";
    finishBtn.style.display="inline-block";
    startTime = new Date();
    renderQuestions();
    startTimer();
  });

  function renderQuestions(){
    questionsContainer.innerHTML="";
    questionsData.forEach((q,index)=>{
      const div = document.createElement("div");
      div.classList.add("question-box");
      div.innerHTML = `<p>${index+1}. ${q.question}</p>
        <input type="text" id="answer${index}" placeholder="اكتب إجابتك هنا">
        <p id="feedback${index}" style="color:#ffd700;font-weight:bold;"></p>
        <div id="centers${index}" style="margin-top:5px;color:#a0e7ff;"></div>`;
      questionsContainer.appendChild(div);

      document.getElementById(`answer${index}`).addEventListener("change",()=>{
        checkAnswer(index);
      });
    });
  }

  function startTimer(){
    updateTimerDisplay();
    timer = setInterval(()=>{
      timeLeft--;
      updateTimerDisplay();
      if(timeLeft<=0){
        clearInterval(timer);
        submitAnswers();
      }
    },1000);
  }

  function updateTimerDisplay(){
    let minutes = Math.floor(timeLeft/60).toString().padStart(2,'0');
    let seconds = (timeLeft%60).toString().padStart(2,'0');
    timerP.textContent = `${minutes}:${seconds}`;
  }

  function checkAnswer(index){
    const input = document.getElementById(`answer${index}`).value.trim();
    const feedback = document.getElementById(`feedback${index}`);
    const centersDiv = document.getElementById(`centers${index}`);
    const q = questionsData[index];

    let found = false;
    for(let i=0;i<q.answers.length;i++){
      for(let ans of q.answers[i]){
        if(similarity(input,ans)>=0.8){
          found = true;
          if(!centersUsed[index].includes(i)){
            centersUsed[index].push(i);
            totalScore += i+1;
            feedback.textContent = `✅ صحيح! +${i+1} نقطة`;
          } else {
            feedback.textContent = `⚠️ هذا المركز تم الإجابة عنه مسبقًا`;
          }
          break;
        }
      }
      if(found) break;
    }
    if(!found) feedback.textContent = `❌ خطأ`;

    let displayText = "المراكز: ";
    q.answers.forEach((a,i)=>{
      if(centersUsed[index].includes(i)){
        displayText += `[${i+1}] ✅ `;
      } else {
        displayText += `[${i+1}] ❌ `;
      }
    });
    centersDiv.textContent = displayText;
  }

  finishBtn.addEventListener("click", submitAnswers);
  submitBtn.addEventListener("click", submitAnswers);

  function submitAnswers(){
    clearInterval(timer);
    questionsContainer.style.display="none";
    submitBtn.style.display="none";
    finishBtn.style.display="none";
    resultsDiv.style.display="block";
    const endTime = new Date();
    const timeUsed = Math.floor((endTime-startTime)/1000);
    scoreP.textContent = `النقاط: ${totalScore}`;
    timeTakenP.textContent = `الوقت: ${Math.floor(timeUsed/60)} دقيقة و ${timeUsed%60} ثانية`;
  }

  function similarity(s1,s2){
    s1=s1.toLowerCase();
    s2=s2.toLowerCase();
    let longer=s1.length>s2.length?s1:s2;
    let shorter=s1.length>s2.length?s2:s1;
    let longerLength=longer.length;
    if(longerLength===0) return 1.0;
    let editDistance = levenshtein(longer,shorter);
    return (longerLength-editDistance)/longerLength;
  }

  function levenshtein(a,b){
    const matrix=[];
    for(let i=0;i<=b.length;i++) matrix[i]=[i];
    for(let j=0;j<=a.length;j++) matrix[0][j]=j;
    for(let i=1;i<=b.length;i++){
      for(let j=1;j<=a.length;j++){
        if(b[i-1]===a[j-1]) matrix[i][j]=matrix[i-1][j-1];
        else matrix[i][j]=Math.min(matrix[i-1][j-1]+1, Math.min(matrix[i][j-1]+1, matrix[i-1][j]+1));
      }
    }
    return matrix[b.length][a.length];
  }

});