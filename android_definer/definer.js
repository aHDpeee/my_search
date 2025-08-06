
const definerWindow = document.createElement("div");
definerWindow.id = "definerWindow-definer";
definerWindow.innerHTML = `
	<div id="definerWindow-header"></div>
	<div id="definerWindow-definition"></div>
	<iframe id="definerWindow-content"></iframe>
`;
document.body.appendChild(definerWindow);

function was_inside_container(container, e) {
	const rect = container.getBoundingClientRect();

	const mouseX = e.clientX;
	const mouseY = e.clientY;


	if (
		mouseX >= rect.left &&
		mouseX <= rect.right &&
		mouseY >= rect.top &&
		mouseY <= rect.bottom
	) {
		return true;
	} else {
		return false;
	}
};


document.addEventListener("click", (e) => {
	// definerWindow.classList.remove("show");
	if (was_inside_container(definerWindow, e) || window.getSelection().toString().trim().length > 0) return;
	console.log("show")
	try {
		const element = document.caretPositionFromPoint(e.clientX, e.clientY);
		const offset = element.offset;
		const txt = element.offsetNode.textContent;
		const sel = window.getSelection();
		const ran = document.createRange();

		// console.log(offset, element.offsetNode, txt.length <= 0, txt[offset]);

		if (txt.length <= 0) return;
		const regex1 = /[^\s!\"#$%&'()*+,\./:;<=>?@[\\\]^_`{|}~]/
		if (txt[offset].search(regex1) === -1) return;
		start = 0; end = txt.length;
		for (let i = offset; i < end; i++) {
			if (txt[i].search(regex1) === -1) {
				end = i;
				break;
			}
		}

		for (let i = offset; i > start; i--) {
			if (txt[i].search(regex1) === -1) {
				start = i + 1;
				break;
			}
		}

		// console.log(start, offset, end);

		ran.setStart(element.offsetNode, start);
		ran.setEnd(element.offsetNode, end);

		if (sel.direction !== "none") return;

		sel.removeAllRanges();
		sel.addRange(ran);



	} catch (err) {
		// console.log("just click", err);
		definerWindow.classList.remove("show");

	}
});


function parseDictionaryData(data) {
	// if (!Array.isArray(data) || data.length === 0) return "<p>No definitions found.</p>";

	const entry = data[0];
	let html = "";

	entry.meanings.forEach(meaning => {
		html += `<b>Part of speech: <em>${meaning.partOfSpeech}</em></b><ol>`;
		meaning.definitions.forEach(def => {
			html += `<li>`;
			html += `<p>${def.definition}</p>`;
			if (def.example) html += `<i>Example: "${def.example}"</i>`;
			if (def.synonyms && def.synonyms.length > 0) {
				html += `<p><strong>Synonyms:</strong> ${def.synonyms.join(", ")}</p>`;
			}
			if (def.antonyms && def.antonyms.length > 0) {
				html += `<p><strong>Antonyms:</strong> ${def.antonyms.join(", ")}</p>`;
			}
			html += `</li>`;
		});
		html += `</ol>`;
	});

	return html;
}


async function showPopupWithURL(query) {
	try {
		console.log("showPopup")
		const definerWindow = document.getElementById("definerWindow-definer");
		const content = document.getElementById("definerWindow-content");
		const definition = document.getElementById("definerWindow-definition");
		const head = document.getElementById("definerWindow-header");


		content.src = "https://ahdpeee.github.io/my_search/?q=" + query;
		definerWindow.classList.add("show");
		head.textContent = query;

		try {  
			const res = await chrome.runtime.sendMessage({ type: "getDefinition", word: query }, response => {
				if (!response.success) {
					definition.classList.remove("definerWindow-should-show");
					return;
				}
				const meaning = response.data;
				definition.innerHTML = parseDictionaryData(meaning);
				const entry = meaning[0];
				head.innerHTML = `
    		<b>${entry.word} <small>${entry.phonetic || ""}</small></b>
    		<i>${entry.meanings[0].partOfSpeech}</i><br/>
    		<span class="definerWindow-define">${entry.meanings[0].definitions[0].definition}</span>
  			`;
				definition.classList.add("definerWindow-should-show");
			});;
		} catch (err) { }


	} catch (err) { // console.error("definerWindow error:", err);
		definerWindow.classList.remove("show");

	}
}


document.addEventListener("selectionchange", (e) => {
	const sel = window.getSelection();
	const txt = sel.toString().trim()
	definerWindow.classList.remove("show");

	if (txt.length <= 0) return;
	// showPopupWithURL("https://lite.duckduckgo.com/lite/?q=define:"+txt);
	showPopupWithURL(txt);
});



const style = document.createElement('style');
style.textContent = `


#definerWindow-definer {
	color: #f2f0ecff;
	position: fixed;
	bottom: 0;
	right: 0;
	width: 100%;
	height: fit-content; max-height: 20em; min-height: 0;
	background: #0f101084;
	backdrop-filter: blur(5px);
	box-shadow: 0 0 10px rgba(0,0,0,0.05);
	border-radius-top: 10px;
	overflow: hidden;
	flex-direction: column;
	z-index: 9999;
	transition: 0.3s ease-in-out all;

	pointer-events:none;
	opacity:0;
}

#definerWindow-definer * {
	user-select:none;
	scrollbar-width: none;
}

#definerWindow-definer.expanded #definerWindow-definition.definerWindow-should-show, #definerWindow-definer.expanded #definerWindow-content {
	display: block;
	
}

#definerWindow-definer.expanded {
	bottom:0; left:0; 
	width:100vw; max-height: 100dvh; min-height: 100dvh;
	border-radius: 0;
	overflow:scroll;
}

#definerWindow-definer.show {

	pointer-events:all;
	opacity:1;
}
#definerWindow-header {
	padding: 10px;
	cursor:pointer;
	min-height: 5vh; height: fit-content;
}
#definerWindow-content {
	flex:1;
	width:calc(100% - 2em);
	min-height:calc(100dvh - 2em);
	border:none;
	display:none;
	opacity: 0.9;
	margin: 1em;
	border-radius: 1em;
	
}

p, ol {
	margin-top: 0.25em; margin-bottom: 0.25em;
}

#definerWindow-definition {
	padding: 1em;
	background: #1e2020b2;
	display: none;
	margin: 1em;
	border-radius: 1em;
	backdrop-filter: blur(10px);
}
#definerWindow-definition i {
	opacity:0.7;
}

`;
document.head.appendChild(style);



document.querySelector("#definerWindow-header").addEventListener("click", (e) => {
	const definerWindow = document.getElementById("definerWindow-definer");
	if (!definerWindow.classList.contains("expanded")) definerWindow.classList.add("expanded");
	else definerWindow.classList.remove("expanded");
});


