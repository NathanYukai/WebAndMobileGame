module.exports = {

	'Testing signup error checking, for local host': function (test){
		test
			.wait(2000)
			.open('http://localhost:8080')
			.wait(1000)
			.assert.title().is('Welcome','title is right')
			.assert.exists('#jump_to_home','exist home page')
			.screenshot('screenshots/signup/welcome page.png')

			//test unmatched password when sign up
			.type('#welcome_display', 'displayname')
    		.assert.val('#welcome_display', 'displayname', 'displayText has been set')
			.type('#welcome_usr', 'user')
     		.type('#welcome_pss', 'passwd')
     		.type('#welcome_pssconf', 'passwddiff')
     		.screenshot('screenshots/signup/check input text set.png')
     		.click('#welcome_signup')
     		// since click on sign up on welcomepage should redirect to signup page
     		.screenshot('screenshots/signup/welcome unmatched password.png')
			.wait(1000)
			.assert.exists('#signup_signup','fails register, redirect to sign up page ')
     		
     		//existing username

     		.type('#displayName', 'displayname')
    		.assert.val('#displayName', 'displayname', 'displayText has been set')
			.type('#signup_usr', 'admin')
     		.type('#signup_pss', 'admin')
     		.type('#signup_pssconf', 'admin')
     		.click('#signup_signup')
			.wait(1000)
     		.assert.exists('#signup_signup','fails register, redirect to sign up again')
     		.screenshot('screenshots/signup/register with existing username.png')


     		//short password, for now only workes under chrome
     		.type('#displayName', 'displayname')
    		.assert.val('#displayName', 'displayname', 'displayText has been set')
			.type('#signup_usr', 'adfs')
     		.type('#signup_pss', 'ps')
     		.type('#signup_pssconf', 'ps')
     		.click('#signup_signup')
     		.wait(1000)
		.screenshot('screenshots/signup/register with short password.png')
     		.assert.exists('#signup_signup','fails register, redirect to sign up again')



			.done();
		test.screenshot('screenshots/final.png');
	}
};
