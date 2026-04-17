import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import { BRAND } from '../constants/brand';

export interface PreCadastroData {
  type: 'VISITANTE' | 'PRESTADOR' | 'ALUGANTE';
  name: string;
  date: string;
  morador: string;
  unidade: string;
}

export function generatePreCadastroLink(data: PreCadastroData): string {
  const token = generateUniqueToken();
  const preRegistrationUrl = `${BRAND.siteUrl}/pre-cadastro/${token}`;

  return preRegistrationUrl;
}

export function generateUniqueToken(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}

export function buildWhatsAppMessage(data: PreCadastroData, preRegistrationUrl: string): string {
  const typeLabel = {
    VISITANTE: 'visitante',
    PRESTADOR: 'prestador de servico',
    ALUGANTE: 'hospede',
  }[data.type];

  const message = `Ola!

Voce foi cadastrado como ${typeLabel} no sistema ${BRAND.appName}.

Para agilizar seu acesso, complete seu pre-cadastro neste link:
${preRegistrationUrl}

Envie sua foto
Confirme seus dados
Pronto para entrar

Validade: 7 dias

Qualquer duvida, entre em contato com o morador ou portaria.`;

  return message;
}

export async function shareViaWhatsApp(data: PreCadastroData, preRegistrationUrl: string): Promise<boolean> {
  try {
    const message = buildWhatsAppMessage(data, preRegistrationUrl);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    const canOpen = await Linking.canOpenURL(whatsappUrl);

    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      return true;
    }

    Alert.alert('WhatsApp nao instalado', 'Deseja copiar o link para compartilhar manualmente?', [
      {
        text: 'Copiar link',
        onPress: () => {
          Alert.alert('Link copiado', preRegistrationUrl);
        },
      },
      {
        text: 'Cancelar',
        onPress: () => {},
        style: 'cancel',
      },
    ]);
    return false;
  } catch (error) {
    console.error('Erro ao compartilhar no WhatsApp:', error);
    Alert.alert('Erro', 'Nao foi possivel abrir o WhatsApp.');
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    const Clipboard = require('expo-clipboard');
    await Clipboard.setStringAsync(text);
    Alert.alert('Sucesso', 'Link copiado para a area de transferencia.');
  } catch (error) {
    console.error('Erro ao copiar:', error);
    Alert.alert('Erro', 'Nao foi possivel copiar o link.');
  }
}
