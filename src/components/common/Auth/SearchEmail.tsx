import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useRecoilState, useSetRecoilState } from 'recoil';
import API from '../../../api';
import { EmailInfo, ModalPage } from '../../../Atom/Atoms';
import CreateTitle from '../CreateTitle';
import Input from '../Input';
import { Form, InputWrapper, SubmitWrapper } from './style';

interface Props {
  title?: string;
}

export default function SearchEmail({ title }: Props) {
  const router = useRouter();
  const setModalPage = useSetRecoilState(ModalPage);
  const [emailInfo, setEmailInfo] = useRecoilState(EmailInfo);

  const changeModalType = (type: string) => {
    setModalPage(0);
    router.push(type);
  };
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<{ email: string }>({
    shouldUseNativeValidation: true,
  });

  const searchEmail = async ({ email }: { email: string }) => {
    setEmailInfo({ ...emailInfo, ['email']: email });
    try {
      await API.post('/email', {
        email: email + '@gsm.hs.kr',
      });
      setModalPage((prev) => ++prev);
    } catch (e) {
      if (!(e instanceof AxiosError)) return toast.error('unkonwn error');
      if (e.response?.status === 429)
        return toast.error('15분 동안 최대 3번 요청 가능합니다.');
      if (e.response?.status === 400) {
        toast.info('이미 인증된 이메일 요청입니다.');
        return setModalPage(2);
      }
      if (e.response?.status === 500) return toast.error('error');
    }
  };

  return (
    <>
      <CreateTitle
        title={title}
        logo={true}
        subTitle={'가입하신 이메일을 입력해주세요.'}
      />
      <Form onSubmit={handleSubmit(searchEmail)}>
        <InputWrapper>
          <Input
            label="이메일"
            errors={!!errors.email}
            register={register('email', {
              required: '이메일을 입력하지 않았습니다',
              pattern: {
                value: /^[a-zA-Z0-9]*$/g,
                message: 'GSM메일 형식에 맞게 입력해주세요',
              },
            })}
            fixed="@gsm.hs.kr"
          />
        </InputWrapper>
        <SubmitWrapper>
          <button type="submit">다음</button>
          <p onClick={() => changeModalType('/login')}>로그인 하러가기</p>
        </SubmitWrapper>
      </Form>
    </>
  );
}
