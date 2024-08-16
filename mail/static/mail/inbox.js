document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  //composing the mail
  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
    });

    load_mailbox('sent');

    return false;

  }
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox === 'inbox'){
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
      const ul = document.createElement('ul');
      ul.classList.add('ul');
      document.querySelector('#emails-view').append(ul);
    emails.forEach(email => {
      const div = document.createElement('div');
      if(email.read === true){
        div.classList.add('div-read');
      }
      else{
        div.classList.add('div-unread');
      }
      const sender = document.createElement('li');
      const subject = document.createElement('li');
      const timestamp = document.createElement('li');
      sender.innerHTML = email.sender;
      subject.innerHTML = email.subject;
      timestamp.innerHTML = email.timestamp;
      sender.classList.add('sender');
      timestamp.classList.add('timestamp');
      ul.append(div);
      div.append(sender);
      div.append(subject);
      div.append(timestamp);
      div.addEventListener('click', () => load_email(email.id, 'archivable'));
    });
  });
  }

  else if(mailbox === 'sent'){
    fetch('/emails/sent')
    .then(response => response.json())
    .then(emails => {
      const ul = document.createElement('ul');
      ul.classList.add('ul');
      document.querySelector('#emails-view').append(ul);
    emails.forEach(email => {
      const div = document.createElement('div');
      div.classList.add('div-unread');
      const recipients = document.createElement('li');
      const subject = document.createElement('li');
      const timestamp = document.createElement('li');
      recipients.innerHTML = email.recipients;
      subject.innerHTML = email.subject;
      timestamp.innerHTML = email.timestamp;
      recipients.classList.add('sender');
      timestamp.classList.add('timestamp');
      ul.append(div);
      div.append(recipients);
      div.append(subject);
      div.append(timestamp);
      div.addEventListener('click', () => load_email(email.id, 'un-archivable'));
    });
    });
  }

  
  else {
    fetch('/emails/archive')
    .then(response => response.json())
    .then(emails => {
      const ul = document.createElement('ul');
      ul.classList.add('ul');
      document.querySelector('#emails-view').append(ul);
    emails.forEach(email => {
      const div = document.createElement('div');
      if(email.read === true){
        div.classList.add('div-read');
      }
      else{
        div.classList.add('div-unread');
      }
      const sender = document.createElement('li');
      const subject = document.createElement('li');
      const timestamp = document.createElement('li');
      sender.innerHTML = email.sender;
      subject.innerHTML = email.subject;
      timestamp.innerHTML = email.timestamp;
      sender.classList.add('sender');
      timestamp.classList.add('timestamp');
      ul.append(div);
      div.append(sender);
      div.append(subject);
      div.append(timestamp);
      div.addEventListener('click', () => load_email(email.id, 'archivable'));
    });
  });
  }
}

function load_email(email_id, arr){
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  view = document.querySelector('#emails-view');
  view.innerHTML = '';
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    const ul = document.createElement('ul');
    ul.classList.add('ul');
    const sender = document.createElement('li');
    const recipients = document.createElement('li');
    const subject = document.createElement('li');
    const timestamp = document.createElement('li');
    const reply = document.createElement('button');

    sender.innerHTML = `From: ${email.sender}`;
    recipients.innerHTML = `To: ${email.recipients}`;
    subject.innerHTML = `Subject: ${email.subject}`;
    timestamp.innerHTML = `Timestamp: ${email.timestamp}`;
    reply.innerHTML = 'Reply';

    reply.classList.add('button');

    view.append(ul);
    ul.append(sender);
    ul.append(recipients);
    ul.append(subject);
    ul.append(timestamp);
    ul.append(reply);

    if( arr === 'archivable'){
      const archive = document.createElement('button');
      const archived = document.createElement('button');

      archive.innerHTML = 'Archive';
      archived.innerHTML = 'Unarchive';

      archive.classList.add('button');
      archived.classList.add('button');

      if(email.archived){
        ul.append(archived);
      } else {
        ul.append(archive);
      }

      archive.addEventListener('click', () => archive_email(email.id));
      archived.addEventListener('click', () => unarchive_email(email.id));

    }

    reply.addEventListener('click', () => Reply(email.sender, email.subject, email.timestamp, email.body));

    const hr = document.createElement('hr');
    ul.append(hr);

    const body = document.createElement('li');
    body.innerHTML = email.body;
    ul.append(body);

  })

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read:true
    })
  } )

}

function archive_email(email_id){
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived:true
    })
  })
 load_mailbox('archive');
}

function unarchive_email(email_id){
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived:false
    })
  })
  load_mailbox('inbox');
}

function Reply(email_sender, email_subject, email_timestamp, email_body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  const recipient = document.querySelector('#compose-recipients');
  recipient.value = email_sender;

  const subject = document.querySelector('#compose-subject');
  subject.value = `Re: ${email_subject}`;

  const body = document.querySelector('#compose-body');
  body.value = `On ${email_timestamp} ${email_sender} wrote: ${email_body}`;



  //composing the mail
  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipient.value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
    });

    load_mailbox('sent');

    return false;
  }
}