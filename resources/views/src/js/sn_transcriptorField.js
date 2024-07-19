import Sortable from "sortablejs";

const initTranscriptorField = (targetField) => {

    let languages = [
        ['Afrikaans',       ['af-ZA']],
        ['Bahasa Indonesia',['id-ID']],
        ['Bahasa Melayu',   ['ms-MY']],
        ['Català',          ['ca-ES']],
        ['Čeština',         ['cs-CZ']],
        ['Deutsch',         ['de-DE']],
        ['English',
            ['en-AU', 'Australia'],
            ['en-CA', 'Canada'],
            ['en-IN', 'India'],
            ['en-NZ', 'New Zealand'],
            ['en-ZA', 'South Africa'],
            ['en-GB', 'United Kingdom'],
            ['en-US', 'United States']
        ],
        ['Español',
            ['es-AR', 'Argentina'],
            ['es-BO', 'Bolivia'],
            ['es-CL', 'Chile'],
            ['es-CO', 'Colombia'],
            ['es-CR', 'Costa Rica'],
            ['es-EC', 'Ecuador'],
            ['es-SV', 'El Salvador'],
            ['es-ES', 'España'],
            ['es-US', 'Estados Unidos'],
            ['es-GT', 'Guatemala'],
            ['es-HN', 'Honduras'],
            ['es-MX', 'México'],
            ['es-NI', 'Nicaragua'],
            ['es-PA', 'Panamá'],
            ['es-PY', 'Paraguay'],
            ['es-PE', 'Perú'],
            ['es-PR', 'Puerto Rico'],
            ['es-DO', 'República Dominicana'],
            ['es-UY', 'Uruguay'],
            ['es-VE', 'Venezuela']
        ],
        ['Euskara',         ['eu-ES']],
        ['Français',        ['fr-FR']],
        ['Galego',          ['gl-ES']],
        ['Hrvatski',        ['hr_HR']],
        ['IsiZulu',         ['zu-ZA']],
        ['Íslenska',        ['is-IS']],
        ['Italiano',
            ['it-IT', 'Italia'],
            ['it-CH', 'Svizzera']
        ],
        ['Magyar',          ['hu-HU']],
        ['Nederlands',      ['nl-NL']],
        ['Norsk bokmål',    ['nb-NO']],
        ['Polski',          ['pl-PL']],
        ['Português',
            ['pt-BR', 'Brasil'],
            ['pt-PT', 'Portugal']
        ],
        ['Română',          ['ro-RO']],
        ['Slovenčina',      ['sk-SK']],
        ['Suomi',           ['fi-FI']],
        ['Svenska',         ['sv-SE']],
        ['Türkçe',          ['tr-TR']],
        ['български',       ['bg-BG']],
        ['Pусский',         ['ru-RU']],
        ['Српски',          ['sr-RS']],
        ['한국어',            ['ko-KR']],
        ['中文',
            ['cmn-Hans-CN', '普通话 (中国大陆)'],
            ['cmn-Hans-HK', '普通话 (香港)'],
            ['cmn-Hant-TW', '中文 (台灣)'],
            ['yue-Hant-HK', '粵語 (香港)']
        ],
        ['日本語',           ['ja-JP']],
        ['Lingua latīna',   ['la']]
    ];

    let errorMessages = {
        "no-speech" : "No speech was detected.",
        "aborted" : "Speech recognition has been stopped.",
        "audio-capture" : "There was an speech recognition audio capture error.",
        "network" : "There was a speech recognition network error.",
        "not-allowed" : "Speech recognition is not allowed.",
        "service-not-allowed" : "The speech recognition service is not allowed.",
        "bad-grammar" : "There was an error due to bad grammar.",
        "language-not-supported" : "This language is not supported."
    };

    const initSortTranscript = (final) => {
        Sortable.create(final, {
            draggable: 'li',
            onEnd: function (e) {
                setTimeout(() => {
                }, 1500);
            },
        });
    }

    const deleteTranscriptLI = (e) => {
        e.target.closest('li').remove();
    }

    const initDeleteDots = () => {
        let deleteDots = document.querySelectorAll('.final li i');
        if(deleteDots){
            for (let d = 0; d < deleteDots.length; d++) {
                deleteDots[d].addEventListener('click', deleteTranscriptLI);
            }
        }
    }

    const finalizeTranscript = (e) => {
        stopListening();
        let targetSNFW = e.target.closest('.snfw');
        let targetField = targetSNFW.querySelector('.editor');
        console.log('targetSNFW: ', targetSNFW);
        console.log('targetField: ', targetField);
        let phrases = targetSNFW.querySelectorAll('.final li .content');
        console.log('phrases: ', phrases);

        if(phrases.length > 0){
            console.log('phrases: ', phrases);
            let transcript = [];
            for (let p = 0; p < phrases.length; p++) {
                transcript.push(phrases[p].innerText);
            }
            transcript = transcript.join(' ');
            transcript = transcript.replaceAll('*', '-');
            targetField.innerHTML =  targetField.innerHTML + "\r\n\r\n<p>" + transcript + "</p>\r\n\r\n";

            // display save button
            sn_topics.topicChanged();



        }
        targetSNFW.classList.remove('ready');
        interimResult.innerText = '';
        finalResult.innerText = '';

    }

    const initDoneDot = () => {
        done.addEventListener('click', finalizeTranscript);
    }

    function generateTranscriptLI(content, period){
        let transcriptContainer = document.createElement('li');
        let deleteDot =  document.createElement('i');
        transcriptContainer.appendChild(deleteDot);
        let textContainer = document.createElement('span');
        textContainer.classList.add('content');
        textContainer.setAttribute('contenteditable', true);
        textContainer.textContent = content;
        if(period) { textContainer.textContent = textContainer.textContent + '.'; }
        transcriptContainer.appendChild(textContainer);
        return transcriptContainer;
    }

    // console.log('targetField: ', targetField);

    let selectLanguage = targetField.querySelector('select.l');
    let selectDialect =  targetField.querySelector('select.d');
    let init = targetField.querySelector('.init');
    let toggleStartStop = targetField.querySelector('.mic');
    let reset = targetField.querySelector('.reset');
    let done = targetField.querySelector('.done');
    let interimResult = targetField.querySelector('.interim');
    let finalResult = targetField.querySelector('.final');
    let speechRecognition = new webkitSpeechRecognition();
    let recognizing = false;
    let resultObject;
    const newTranscript = new Event("newTranscript");

    function updateCountry() {
        for (let i = selectDialect.options.length - 1; i >= 0; i--) {
            selectDialect.remove(i);
        }
        let list = languages[selectLanguage.selectedIndex];
        for (let i = 1; i < list.length; i++) {
            selectDialect.options.add(new Option(list[i][1], list[i][0]));
        }
        selectDialect.style.visibility = list[1].length === 1 ? 'hidden' : 'visible';
    }

    function appendTranscript(content, period = false){
        let transcriptContainer = generateTranscriptLI(content, period);
        finalResult.appendChild(transcriptContainer);
        initDeleteDots();
        initSortTranscript(finalResult);
    }

    function startListening() {

        console.log('startListening fired...');
        speechRecognition.start();
        recognizing = true;
        targetField.classList.add('listening');

        setTimeout(() => {
            window.scrollBy(0,100);
        }, 250);

    }

    function stopListening() {
        console.log('stopListening fired...');
        speechRecognition.stop();
        recognizing = false;
        targetField.classList.remove('listening');
    }

    init.onclick = () => {
        startListening();
        targetField.classList.add('ready');
    }

    toggleStartStop.onclick = () => {
        if(recognizing === true){ stopListening(); }
        else { startListening(); }
    }

    reset.onclick = () => {
        finalResult.innerText = '';
    }

    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.maxAlternatives = 20;
    speechRecognition.lang = selectDialect.value;

    interimResult.innerHTML = '';
    finalResult.innerHTML = '';

    for (let i = 0; i < languages.length; i++) {
        selectLanguage.options[i] = new Option(languages[i][0], i);
    }
    selectLanguage.selectedIndex = 6;
    updateCountry();
    selectDialect.selectedIndex = 6;
    selectLanguage.onchange = () => { updateCountry(); }

    targetField.onclick = () => {}
    speechRecognition.onspeechstart = () => {};
    speechRecognition.onstart = () => {};
    speechRecognition.onend = () => {
        console.log('speech recognition has ended');
        // stopListening();
    };
    speechRecognition.onerror = (e) => {
        targetField.classList.add('error');
        targetField.dataset.error = errorMessages[e.error];
        console.error(`Speech recognition error detected: ${e.error}`);
        stopListening();
        targetField.onclick = () => {
            targetField.classList.remove('error');
            targetField.removeAttribute('data-error');
        }
    };

    speechRecognition.onresult = (e) => {
        let interimTranscript = "";
        resultObject = e;
        for (let i = resultObject.resultIndex; i < resultObject.results.length; ++i) {
            if (resultObject.results[i].isFinal) {
                appendTranscript(resultObject.results[i][0].transcript.replaceAll('*', '-'), true);
                document.dispatchEvent(newTranscript);
            }
            else {
                interimTranscript += resultObject.results[i][0].transcript.replaceAll('*', '-');
            }
        }
        interimResult.innerHTML = interimTranscript;
    };




    initDeleteDots();
    initDoneDot(targetField);

    return true;

}

if ("webkitSpeechRecognition" in window) {
    let transcriptorFields = document.querySelectorAll('.transcriptor');
    if(transcriptorFields){
        for (let f = 0; f < transcriptorFields.length; f++) {
            initTranscriptorField(transcriptorFields[f]);
        }
    }

}



