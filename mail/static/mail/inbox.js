document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#sendMail').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
	console.log('b')
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  console.log('z')
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
		.then(response => response.json())
		.then(emails => {
    // Print emails
    console.log('x')
    console.log(emails);

    // ... do something else with emails ...
});
}

function send_email() {

	let subject = document.querySelector('#compose-subject').value;
	let recipients = document.querySelector('#compose-recipients').value;
	let body = document.querySelector('#compose-body').value;

	// TODO: validate input

	fetch('/emails', {
		method: 'POST',
		body: JSON.stringify({
			recipients,
			subject,
			body,
		})
	})
	.then(response => response.json())
	.then(result => {
	    // Print result
	    alert(result)
	    console.log(result);
	})
	.catch((error) => {
		console.error('Error', error)
		alert(error)
		console.log(error);
	});
}



