if( document.readyState !== 'loading' ) {
    console.log( 'document is already ready, just execute code here' );
    myInitCode();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        console.log( 'document was not ready, place code here' );
        myInitCode();
    });
}

function myInitCode() {
	// Use buttons to toggle between views
	document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
	document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
	document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
	document.querySelector('#compose').addEventListener('click', compose_email);
	document.querySelector('#sendMail').addEventListener('click', send_email);

	// By default, load the inbox
	load_mailbox('inbox');

}

function compose_email(sentEmail = null) {

	// Show compose view and hide other views
	clearReactDom()
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'block';

	// Clear out composition fields
	document.querySelector('#compose-recipients').value = '';
	document.querySelector('#compose-subject').value = '';
	document.querySelector('#compose-body').value = '';

	// Populate the composition fields if user is replying to the 'sentEmail'
	if (sentEmail) {
		document.querySelector('#compose-recipients').value = sentEmail.sender;
		document.querySelector('#compose-subject').value = (sentEmail.subject.trim().substring(0,3) === 'Re:')
			? sentEmail.subject
			: `Re: ${sentEmail.subject}`;

		let body = `\n~On ${sentEmail.timestamp}, ${sentEmail.sender} wrote:\n${sentEmail.body}`
		document.querySelector('#compose-body').value = body;
	}

}

function load_mailbox(mailbox) {
	// Show the mailbox and hide other views
	clearReactDom()
	document.querySelector('#emails-view').style.display = 'block';
	document.querySelector('#compose-view').style.display = 'none';

	// Show the mailbox name
	document.querySelector('#emails-view__heading').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

	fetch(`/emails/${mailbox}`)
		.then(response => response.json())
		.then(emails => {
		// Print emails
		console.log(emails);

		// ... do something else with emails ...
		renderEmailsView(emails)
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
	    console.log(result);
	})
	.catch((error) => {
		console.error('Error', error)
	});
}

function view_email(email) {
	// Show the mailbox and hide other views
	clearReactDom();
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'none';
	document.querySelector('#readEmail-view').style.display = 'block';

	class ReadEmail extends React.Component {
		
		constructor(props) {
          super(props);
          this.state = {
            archived: email.archived
          };
        }

		render() {
			return (
				<div className="readEmail" id="email.id">
					<div className="readEmail__header">
						<p><strong>From: </strong>{ email.sender }</p>
						<p><strong>To: </strong>{ email.recipients }</p>
						<p><strong>Subject: </strong>{ email.subject }</p>
						<p><strong>Timestamp: </strong>{ email.timestamp }</p>
					</div>
					<div className="readEmail__action">
						<button className="btn btn-primary" onClick={ this.actionReply }>Reply</button>
						<button className="btn btn-primary" onClick={ this.actionArchive }>
							{ this.state.archived ? 'Un-Archive' : 'Archive' }
						</button>
					</div>
					<hr/>
					<p className="readEmail__body">{ email.body }</p>
        		</div>
			);
		}

		actionArchive = () => {
			fetch(`/emails/${email.id}`, {
				method: 'PUT',
				body: JSON.stringify({
					archived: !email.archived
				})
			})
			.then(result => {
				// Print result
				console.log(result);
				this.setState(state => ({
					archived: !state.archived
				}));
			})
			.catch((error) => {
				console.error('Error', error)
			});
		}

		actionReply = () => {
			compose_email(email);
			console.log('REPLY TODO');
		}
	}

	ReactDOM.render(<ReadEmail />, document.querySelector("#readEmail-view"));

}

function renderEmailsView(emails) {
	
	class EmailCard extends React.Component {

		render() {
			return (
				<div className="emailCard" id={"email" + this.props.index}>
					<p>{this.props.sender}</p>
					<p>{this.props.subject}</p>
					<p>{this.props.timestamp}</p>
        		</div>
			);
		}
	}

	let list = [];
	for (let i = 0; i < emails.length; i += 1) {
		list.push(<EmailCard sender={emails[i].sender} subject={emails[i].subject} timestamp={emails[i].timestamp} index={i} />)
	}

	class EmailList extends React.Component {
		render() {
			return (
				<div>
					{ list }
				</div>
			);
		}
	}

	ReactDOM.render(<EmailList />, document.querySelector("#emails-view__component"));

	document.querySelectorAll('.emailCard').forEach(el => {
		el.addEventListener('click', (event) => {
			let emailIndex = el.id.replace('email', '')
			view_email(emails[emailIndex])
		})
	})
}

function clearReactDom() {
	 ReactDOM.unmountComponentAtNode(document.getElementById('emails-view__component'));
	 ReactDOM.unmountComponentAtNode(document.getElementById('readEmail-view'));
}






