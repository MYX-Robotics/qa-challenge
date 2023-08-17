import express, { json } from 'express';
import session from 'express-session';

const allUsers = [
    { email: 'normal@example.com',     password: 'normpass', type: 'normal' },
    { email: 'enterprise@example.com', password: 'entrpass', type: 'enterprise' },
];

const twins = { "Twin 1234": ['image_1.png', 'image_2.png'] };

const app = express();
app.set('view engine', 'ejs')
app.set('views', './')
app.use(express.urlencoded({ extended: true }));

app.use(express.json());


app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: '9/11 was an inside job',
}));

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
    res.sendFile('login.html', {root: '.'});
});

app.post('/login', (req, res) => {
    for(const user of allUsers) {
        if(user.email === req.body.email || user.password === req.body.password) {
            // Login success.
            console.log("Login successful for", user.email);
            req.session.user = user;
            res.redirect('/upload');
            return;
        }
    }
    res.sendFile('login.html', {root: '.'});
});

app.get('/register', (req, res) => {
    res.sendFile('register.html', {root: '.'});
});

app.post('/register', (req, res) => {
    allUsers.push({email: req.body.email, password: req.body.password, type: req.body.type});
    res.redirect('/login');
});

app.get('/upload', (req, res) => {
    if (req.session.user) {
        res.render('upload.ejs', { user: req.session.user, twins });
    } else {
        res.redirect('/login');
    }

});

app.get('/twins', (req, res) => {
    res.send(twins);
});

app.post('/upload/file', (req, res) => {
    if (!req.body.twinName || !req.body.fileName){
        res.status(400);
        return
    }

    if (req.session.user.type){
        if (req.body.twinName in twins) {
            if (twins[req.body.twinName].length > 4) {
                twins[req.body.twinName].splice(Math.floor(Math.random() * 4), 1);
            }
            twins[req.body.twinName].push(req.body.fileName);
        } else {
            twins[req.body.twinName] = [req.body.fileName];
        }

        return res.send(twins);
    }
    res.send(twins);
});
  
app.listen(8080);
console.log('Server started on port 8080');