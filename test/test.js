module.exports = {

	'Test for local host': function (test){
		test
			.wait(2000)
			.open('http://localhost:8080')
			.assert.title().is('Welcome','title is right')
			.wait(1000)
			.assert.exists('#jump_to_home','exist home page')
			.screenshot('screenshots/test/welcome page.png')

     		//check home page have expected buttons
			.click('#jump_to_home')
			.wait(1000)
			.assert.exists('#play','exist play page')
			.assert.exists('#signin','exist signin button')
			.assert.exists('#signup','exist signup button')
			.assert.doesntExist('#createLevel','not login shoudnt be able to create level')			
			.screenshot('screenshots/test/homepage.png')

			//check when select levels tehre are no unexpected buttons when not logged in
			.click('#play')
			.wait(1000)
			.assert.doesntExist('#createLevel','not login shoudnt be able to create level')
			.assert.doesntExist('logout','cant logout when not logged in')
			.screenshot('screenshots/test/levels not logged in.png')

			// assume admin is an existing account
			.click('#signin')
			.wait(1000)
			.type('#login_usr', 'admin')
    		.type('#login_pss', 'passwd')
    		.click('#login_submit')
			.wait(1000)
    		.assert.title().is('Select Levels','title is select levels')
    		.assert.exists('#createLevel')
    		.screenshot('screenshots/test/levels when logged in.png')

    		.click('#createLevel')
			.wait(1000)
			.assert.exists('#saveButton','exists savebutton')
			.assert.exists('#verifyButton','exists verifyButton')
			.click('#verifyButton')
			.accept()
    		.click('#saveButton')
    		.wait(1000)
    		.accept()

    		.execute(function() {
    			
    		})


    		.wait(1000)
    		.screenshot('screenshots/test/final.png')
			.done();
			}
};
