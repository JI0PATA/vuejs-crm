let app = new Vue({
  el: '#app',
  data: {
    authData: null,
    currentComponentTab: {
      tabName: "home",
      id: null
    },
    loginData: {
      email: '',
      password: ''
    },
    db: [],
    selectedUser: {},
    selectedProject: {},
    selectedTask: {},
    selectManager: "",
    selectWorking: "",
    selectCheckbox: "",
    selectFile: null,
    availableUsersForProject: [],
    usersInProject: [],
    availableUsersForTask: [],
    gender: [
      {value: 0, name: "Male"},
      {value: 1, name: "Female"}
    ],
    accesses: [
      {key: "create-users", name: "Create users"},
      {key: "edit-accesses", name: "Edit accesses"},
      {key: "create-projects", name: "Create projects"}
    ],
  },
  methods: {

    bindEvents() {
      /*window.addEventListener('hashchange', ev => {
        this.getRouterParams();
      });*/
    },

    // Смена активной вкладки
    setComponentTab(tabName, id = null) {
      // Проверка доступа к странице
      // this.checkAccess();

      this.currentComponentTab.tabName = tabName;
      this.currentComponentTab.id = id;

      this.setRouterParams(this.currentComponentTab.tabName, this.currentComponentTab.id);

      this.doActionTab(tabName);
    },

    doActionTab(tab) {
      switch (tab) {
        case 'task-form': {
          this.changeSelectedProject();
          this.changeSelectedTask();
          this.getAvailableUsersForTask();
          break;
        }
        case 'users-form': {
          this.changeSelectedUser();
          break;
        }
        case 'access-form': {
          this.changeSelectedUser();

          break;
        }
        case 'project': {
          this.changeSelectedProject();
          break;
        }
        case 'project-create': {
          this.changeSelectedProject();
          break;
        }
        case 'task': {
          this.changeSelectedTask();
          break;
        }
        default:
          // console.log('ничего');
          break;
      }

    },

    // Проверка, является ли вкладка текущей
    isCurrentTab(tabName) {
      return this.currentComponentTab.tabName === tabName;
    },

    parseHash() {
      return window.location.hash.substr(1, window.location.hash.length).split('/');
    },

    getTabId() {
      return this.currentComponentTab.id;
    },

    // Сохранение в LocalStorage объекта
    setLocalStorageOfObject(key, value) {
      window.localStorage.setItem(key, JSON.stringify(value));
    },

    // Получение из LocalStorage объекта
    getLocalStorageOfObject(key) {
      return JSON.parse(window.localStorage.getItem(key));
    },

    // Удаление из LocalStorage объкта
    removeLocalStorageOfObject(key) {
      window.localStorage.removeItem(key);
    },

    // Получение параметров для роутинга
    getRouterParams() {
      let hash = this.parseHash();

      let params = '';

      if (hash[1] !== undefined) params += hash[1];
      if (hash[2] !== undefined) params += '/' + hash[2];

      this.setComponentTab(hash[0], params);
    },

    setRouterParams(tabName, id = null) {
      let hash = tabName;

      if (id !== null) hash += '/' + id;

      window.location.hash = hash;
    },

    signIn() {
      let user = this.getUsers().find(user => {
        return user.email === this.loginData.email && user.password === this.loginData.password;
      });

      if (user !== undefined) {
        this.authData = user;
        this.setLocalStorageOfObject('authData', user);
      }
    },

    getUsers() {
      return this.db.users;
    },

    getProjects() {
      return this.db.projects;
    },

    getAccesses() {
      return this.db.accesses;
    },

    getUserById(id) {
      return this.getUsers().find(user => user.id === parseInt(id));
    },

    getUserByName(username) {
      return this.getUsers().find(user => user.username === username);
    },

    getProjectById(id) {
      return this.getProjects().find(project => project.id === parseInt(id));
    },

    getTaskInCurrentProjectById(id) {
      return this.getProjectById(this.selectedProject.id).tasks.find(task => task.id === parseInt(id));
    },

    getCheckboxInCurrentTaskById(id) {
      return this.selectedTask.checklist.find(checkbox => checkbox.id === parseInt(id));
    },

    logout() {
      this.authData = null;
      this.removeLocalStorageOfObject('authData');
    },

    changeSelectedUser() {
      if (!this.currentComponentTab.id) {
        this.selectedUser = {
          accesses: [],
          email: "",
          first_name: "",
          gender: 0,
          id: this.db.users.length + 1,
          last_name: "",
          password: "",
          user_create: 0,
          username: ""
        };
      } else {
        this.selectedUser = this.getUserById(this.currentComponentTab.id);
      }
    },

    changeSelectedProject() {
      if (!this.currentComponentTab.id) {
        let lastId = this.db.projects.length + 1;

        this.selectedProject = {
          "id": lastId,
          "user_create": this.authData.id,
          "user_compiled": "",
          "title": "",
          "description": "",
          "users": {
            "manager": [],
            "working": []
          },
          "tasks": []
        };
        this.getAvailableUsersForProject();
      }
      else
        this.selectedProject = this.getProjectById(this.currentComponentTab.id);

    },

    changeSelectedTask() {
      if (this.currentComponentTab.tabName === 'task-form') {
        let lastId = this.selectedProject.tasks.length + 1;

        this.selectedTask = {
          "id": lastId,
          "user_create": this.authData.id,
          "user_compiled": null,
          "title": "",
          "description": "",
          "checklist": [],
          "files": [],
          "users": []
        };
        this.getAvailableUsersForTask();
      } else {
        this.selectedProject = this.getProjectById(this.parseHash()[1]);
        this.selectedTask = this.getTaskInCurrentProjectById(this.parseHash()[2]);
      }
    },

    saveDB() {
      this.setLocalStorageOfObject('db', this.db);
    },

    createUser() {
      this.db.users.push(this.selectedUser);
      this.saveDB();
    },

    checkInputAccess(accessKey) {
      let userAccesses = this.selectedUser.accesses;

      return userAccesses.indexOf(accessKey) !== -1;
    },

    getStatus(status) {
      if (status === null) return "<span class='text-danger'>Not complete</span>";
      else return "<span class='text-success'>Complete</span>";
    },

    getAvailableUsers() {
      let users = this.getUsers();

      return users.filter(user => user.id !== this.authData.id);
    },

    redirect(tabName, id = null) {
      this.setComponentTab(tabName, id);
    },

    addManagerInProject() {
      if (this.selectManager.length === 0) return;
      this.selectedProject.users.manager.push(this.getUserByName(this.selectManager).id);
      this.selectManager = "";
      this.getAvailableUsersForProject();
    },

    addWorkingInProject() {
      if (this.selectWorking.length === 0) return;
      this.selectedProject.users.working.push(this.getUserByName(this.selectWorking).id);
      this.selectWorking = "";
      this.getAvailableUsersForProject();
    },

    getAvailableUsersForProject() {
      this.availableUsersForProject = this.getAvailableUsers().filter(el => {
        if (!this.selectedProject.users.manager.includes(el.id) && !this.selectedProject.users.working.includes(el.id)) return true;
      });
    },

    getUsersInProject() {
      this.usersInProject = this.getAvailableUsers().filter(el => this.selectedProject.users.working.includes(el.id));
      return this.usersInProject;
    },

    getAvailableUsersForTask() {
      this.availableUsersForTask = this.getUsersInProject().filter(el => !this.selectedTask.users.includes(el.id));
    },

    removeUserInProject(id) {
      if (this.selectedProject.users.manager.includes(id)) this.selectedProject.users.manager.splice(this.selectedProject.users.manager.indexOf(id), 1);
      else if (this.selectedProject.users.working.includes(id)) this.selectedProject.users.working.splice(this.selectedProject.users.working.indexOf, 1);
      this.getAvailableUsersForProject();
    },

    createProject() {
      this.db.projects.push(this.selectedProject);
      this.saveDB();
      this.redirect('projects');
    },

    createTask() {
      this.db.projects[this.db.projects.indexOf(this.selectedProject)].tasks.push(this.selectedTask);
      this.saveDB();
      this.redirect('project', this.currentComponentTab.id);
    },

    addUserInTask() {
      if (this.selectWorking.length === 0) return;
      this.selectedTask.users.push(this.getUserByName(this.selectWorking).id);
      this.selectWorking = "";
      this.getAvailableUsersForTask();
    },

    addCheckboxInTask() {
      if (this.selectCheckbox.length === 0) return;
      let lastId = this.selectedTask.checklist.length + 1;
      this.selectedTask.checklist.push({
        "id": lastId,
        "title": this.selectCheckbox,
        "checked": false,
        "user_compiled": null
      });
      this.selectCheckbox = "";
    },

    removeUserInTask(id) {
      this.selectedTask.users.splice(this.selectedTask.users.indexOf(id), 1);
      this.getAvailableUsersForTask();
    },

    removeCheckboxInTask(id) {
      this.selectedTask.checklist.splice(this.selectedTask.checklist.indexOf(id), 1);
    },

    checkFile(file) {
      let files = Array.from(file.target.files);

      this.files = files;

      files.map(el => {
        if (el.type in ['image/jpeg', 'image/png']) {
          let lastId = this.selectedTask.files.length + 1;
          this.getBase64(el)
            .then(data => {
              this.selectedTask.files.push({
                "id": lastId,
                "file": el.name,
                "base64": data
              });
            });
        }
      });
    },

    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = _ => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    },

    checkedCheckboxInTask(id) {
      let checkbox = this.getCheckboxInCurrentTaskById(id);

      if (this.selectedTask.users.some(user => user === this.authData.id) && checkbox.checked !== true) {
        checkbox.checked = true;
        checkbox.user_compiled = this.authData.id;
        this.saveDB();
      }
    },

    completeTask(id) {
      if (!this.selectedTask.checklist.some(checkbox => checkbox.checked === false)) {
        this.selectedTask.user_compiled = this.authData.id;
        this.saveDB();
      }
    }

  },

  created() {
    if (!window.localStorage.getItem('db'))
      fetch('dump.json')
        .then(res => res.text())
        .then(res => window.localStorage.setItem('db', res));
    else
      this.db = this.getLocalStorageOfObject('db');

    let authData = this.getLocalStorageOfObject('authData');
    if (authData) this.authData = authData;

    if (window.location.hash.length === 0) {
      this.redirect('home');
    } else {
      this.getRouterParams();
    }

    this.bindEvents();
  },

});