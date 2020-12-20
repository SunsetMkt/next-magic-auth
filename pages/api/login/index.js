import gql from 'graphql-tag';
import Joi from 'joi';

import config from '../../../src/server/config';
import graphql from '../../../src/server/graphql';
import auth from '../../../src/server/auth';
import random from '../../../src/utils/random';
import serverEmail from '../../../src/server/email';

// schema for validating username and password
const schema = Joi.object({
  email: Joi.string().email().required(),
});

export default async function login(req, res) {
  try {
    const form = JSON.parse(req.body);
    const { error, value } = schema.validate(form);

    if (error) {
      const [errorDetail] = error.details;

      return res
        .status(400)
        .json({ error: true, message: errorDetail.message });
    }

    // upsert user by email (get if existing, create if not)
    const { email } = value;

    const upsertUserData = await graphql.query(upsertUser, {
      variables: { email },
    });

    const [user] = upsertUserData.insert_user.returning;

    const {
      token: loginToken,
      expires: loginTokenExpires,
    } = auth.generateLoginToken();

    // store token to confirm via email link
    await graphql.query(setLoginToken, {
      variables: { userId: user.id, loginToken, expires: loginTokenExpires },
    });

    const loginConfirmUrl = `${
      config.FRONTEND_HOST
    }/api/login/confirm?token=${encodeURIComponent(
      loginToken,
    )}&userId=${encodeURIComponent(user.id)}`;

    console.debug({ loginConfirmUrl });

    // const emailResponse = await serverEmail.send(email, {
    //   subject: 'Login to Magic',
    //   text: `Click this magic link to login! `,
    //   html: `<strong>Click <a href="${url}">this magic link</a> to login!</strong>`,
    // });

    // const jwtToken = auth.generateJWTToken(user);

    return res.status(200).json({
      error: false,
      email,
      // jwtToken,
    });
  } catch (e) {
    return res
      .status(400)
      .json({ error: true, message: e.message, stack: e.stack.split('\n') });
  }
}

const upsertUser = gql`
  mutation UpsertUser($email: String!) {
    insert_user(
      objects: { email: $email }
      on_conflict: { constraint: user_email_key, update_columns: updated }
    ) {
      returning {
        id
      }
    }
  }
`;

const setLoginToken = gql`
  mutation SetLoginToken(
    $loginToken: String!
    $userId: uuid!
    $expires: timestamptz!
  ) {
    insert_loginToken(
      objects: { expires: $expires, userId: $userId, value: $loginToken }
      on_conflict: {
        constraint: loginToken_pkey
        update_columns: [created, value, expires]
      }
    ) {
      affected_rows
    }
  }
`;