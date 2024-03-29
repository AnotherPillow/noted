let config = {};
var converter = new showdown.Converter();

const updateBackground = col => {
    document.querySelector("body").style.background = col;
    document.querySelector('#new').style.background = col;
    config.background = col;
    updateConfig();
}
const updateColour = col => {
    document.querySelector("body").style.color = col;
    document.querySelector('#new').style.border = `2px solid ${col}`;
    document.querySelector("#new").style.color = col;
    config.colour = col;
    updateConfig();
}

api.toRenderer('conf',(event,data)=> {
    console.log(data);
    config = data.config;
    document.querySelector('#colour').value = config.colour;
    updateColour(config.colour);
    document.querySelector('#bg_colour').value = config.background;
    updateBackground(config.background);
    addSections(config.sections);
})

const updateConfig = () => {
    api.send('conf', {config});
}
const addSections = (sections) => {
    let parentDiv = document.querySelector('#left_section');
    parentDiv.innerHTML = '';
    console.log(parentDiv);
    for (i of Object.keys(sections)) {
        console.log(`Key: ${i}`);
        let section = sections[i];
        let sectionDiv = document.createElement('div');
        sectionDiv.classList.add('section');
        
        let sectionTitle = document.createElement('h2');
        console.log(i);
        sectionTitle.innerText = section.title;
        sectionDiv.appendChild(sectionTitle);
        
        for (j in section.tasks) {
            let task = section.tasks[j];
            let taskText = document.createElement('p');
            taskText.innerHTML = task.name;
            let ecapsed_task = JSON.stringify(task).replace(/`/g,'$bt$');
            taskText.setAttribute('onclick',`showInfoOnTask(\`${ecapsed_task}\`, '${i}', ${j})`)
            //taskText.setAttribute('onclick',`showInfoOnTask(JSON.parse(\`${JSON.stringify(task).replace(/`/g,'$bt$')}\`.replace(/\$bt\$/g,'\`')), '${i}', ${j})`)
            
            sectionDiv.appendChild(taskText);    
        }
        parentDiv.appendChild(sectionDiv);
    }
}
const showInfoOnTask = (taskstr,i,j, btn=true) => {
    let task = {}
    if (typeof taskstr == 'string') {
        task = JSON.parse(taskstr.replace(/\$bt\$/g,'`'));
    } else
        task = taskstr;
    console.log({task,i,j});
    // if (del) {
    //     let btn = document.querySelector('.rmBtn');
    //     console.log(btn);
    //     btn.outerHTML = '';
    // }
    let infoDiv = document.querySelector('#right_section');
    infoDiv.innerHTML = '';
    let title = document.createElement('h2');
    title.innerHTML = task.name;
    infoDiv.appendChild(title);
    let desc = document.createElement('textarea');
    desc.innerHTML = task.description.replace(/\$nl\$/g,'\n');
    infoDiv.appendChild(desc);

    let preview = document.createElement('div');
    preview.classList.add('preview');
    preview.style.display = 'none';
    infoDiv.appendChild(preview);
    
    if (btn) {
        let rmBtn = document.createElement('button');
        rmBtn.innerText = 'Remove';
        rmBtn.classList.add('rmBtn', 'btn');
        rmBtn.onclick = () => {
            if (j !== 0) {
                console.log(i,j)
                console.log(
                    config.sections[i])
                config.sections[i].tasks.splice(j,j);
                document.querySelector('#right_section').innerHTML = '';
                updateConfig();
                //remove a section from config if empty
                if (config.sections[i].tasks.length == 0) {
                    config.sections.splice(i,1);
                }
                addSections(config.sections);
                showInfoOnTask({name:'Select a task to view info',description:''},null,null, false);
            } else {
                console.log(config.sections[i])
                config.sections[i].tasks.shift()
                addSections(config.sections);
                showInfoOnTask({name:'Select a task to view info',description:''},null,null, false);
            }
        }
        infoDiv.appendChild(rmBtn);

        let svBtn = document.createElement('button');
        svBtn.innerText = 'Save';
        svBtn.classList.add('svBtn', 'btn');
        svBtn.onclick = () => {
            updateTask(i,j);
        }
        infoDiv.appendChild(svBtn);

        let mdBtn = document.createElement("button");
        mdBtn.innerHTML = 'Edit/View'
        mdBtn.classList.add('mdBtn', 'btn');
        let mdEditMode = true;
        mdBtn.onclick = () => {
            swapMDHTML(i,j, mdEditMode);
            mdEditMode = !mdEditMode;

        }

        infoDiv.appendChild(mdBtn);


    }
}
const addSection = (sectionName=undefined, rm=true) => {
    if (!config.sections) config.sections = {};
    if (!sectionName) sectionName = document.querySelector('#modal_input_sect').value;
    let i = 0;
    if (sectionName.length < 1) return;

    try {
        while (config.sections[sectionName]) {
            i++;
        }
    } catch (_) {
        i = 0;
    }
    if (i > 0) sectionName += ` (${i})`;

    config.sections[sectionName] = {
        title: sectionName,
        tasks: []
    }
    if (rm) {
        addSections(config.sections);
        destroyModal();
    }
}

const updateTask = (i,j) => {
    const newText = document.querySelector('#right_section textarea').value.replace(/\n/g,'$nl$');
    
    config.sections[i].tasks[j].description = newText;
    updateConfig();
}

const addTask = () => {
    let sectionName = document.querySelector('#modal_input_sect').value.trim();
    if (!config.sections[sectionName]) 
        addSection(sectionName,false);
    let taskName = document.querySelector('#modal_input_task_name').value;
    let taskDesc = document.querySelector('#modal_input_task_desc').value.replace(/\n/g,'$nl$');
    if (taskName.length < 1 || taskDesc.length < 1) return;
    config.sections[sectionName].tasks.push({
        name: taskName,
        description: taskDesc
    });
    addSections(config.sections);
    updateConfig();
    destroyModal()
}
const destroyModal = () => {
    let modal = document.querySelector('#modal');
    modal.style.display = 'none';
}
const minimise = () => {
    api.send('minimise', {});
}
const maximise = () => {
    api.send('maximise', {});
}
const closeApp = () => {
    api.send('close', {});
}
const showModal = (modalShown) => {
    let el = document.getElementById("modal");
    if (modalShown) {
        el.style.display = "none";
        console.log('hide');
        //modalShown = false;
    } else {
        el.style.display = "block";
        console.log('show');
        //modalShown = true;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    let modalShown = false;
    document.querySelector('#new').onclick = () => {
        showModal(modalShown);
        modalShown = !modalShown;
    }
})

const swapMDHTML = (i,j, mdEditMode) => {
    const textarea = document.querySelector('#right_section textarea')
    const preview = document.querySelector('.preview');
    const rightsection = document.querySelector('#right_section');
    rightsection.style = `--md: "${mdEditMode ? 'Viewing' : 'Editing'}";`;

    if (mdEditMode) {
        preview.style.display = 'block';
        textarea.style = 'display:none; position:absolute; top:-9999px; left:-9999px;';
    } else {
        preview.style.display = 'none';
        textarea.style = 'display:block;'
    }

    const html = converter.makeHtml(textarea.value);

    preview.innerHTML = html;


}