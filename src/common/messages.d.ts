interface StartAuthenticationPayload {
  action: 'start-authentication';
  code: string;
}

interface setPageActionNotAuthorizedPayload {
  action: 'set-page-action-not-authorized';
}

type Payload = StartAuthenticationPayload | setPageActionNotAuthorizedPayload;
