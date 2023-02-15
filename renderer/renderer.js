let config = {};

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
            taskText.innerText = task.name;
            taskText.setAttribute('onclick',`showInfoOnTask(JSON.parse(\`${JSON.stringify(task)}\`), '${i}', ${j})`)
            sectionDiv.appendChild(taskText);    
        }
        parentDiv.appendChild(sectionDiv);
    }
}
const showInfoOnTask = (task,i,j, btn=true) => {
    // if (del) {
    //     let btn = document.querySelector('.rmBtn');
    //     console.log(btn);
    //     btn.outerHTML = '';
    // }
    let infoDiv = document.querySelector('#right_section');
    infoDiv.innerHTML = '';
    let title = document.createElement('h2');
    title.innerText = task.name;
    infoDiv.appendChild(title);
    let desc = document.createElement('p');
    desc.innerText = task.description;
    infoDiv.appendChild(desc);
    
    if (btn) {
        let rmBtn = document.createElement('button');
        rmBtn.innerText = 'Remove';
        rmBtn.classList.add('rmBtn');
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
    }
}
const addSection = (sectionName=undefined, rm=true) => {
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
const addTask = () => {
    let sectionName = document.querySelector('#modal_input_sect').value.trim();
    if (!config.sections[sectionName]) 
        addSection(sectionName,false);
    let taskName = document.querySelector('#modal_input_task_name').value;
    let taskDesc = document.querySelector('#modal_input_task_desc').value;
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