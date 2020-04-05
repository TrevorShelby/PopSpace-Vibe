import React, { useState } from 'react';
import clsx from 'clsx';
import './index.css';

import linkImg from './images/link.svg';
import FormInput from '../FormInput';

type PostLinkProps = {
  onSubmitHandler: Function;
};

const PostLink = (props: PostLinkProps) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [formError, setFormError] = useState('');

  const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (/^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(linkUrl)) {
      // Clear the error and input field, then call the submit handler.
      setFormError('');
      setLinkUrl('');
      props.onSubmitHandler(linkUrl);
    } else {
      // Set the invalid url message.
      setFormError('Please provide a valid URL.');
    }
  };

  return (
    <div className={clsx('PostLink')}>
      <div>
        <img className="PostLink-img" src={linkImg} alt="link_icon" />
      </div>
      <div className="PostLink-text">Add a link</div>
      <div className="PostLink-form">
        <form onSubmit={onSubmitHandler}>
          <FormInput placeholderText={'Url'} value={linkUrl} setValue={setLinkUrl} />
          <div className="PostLink-error">{formError}</div>
          <button type="submit" className={clsx('PostLink-button', { 'is-inactive': linkUrl.length === 0 })}>
            Post Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostLink;
