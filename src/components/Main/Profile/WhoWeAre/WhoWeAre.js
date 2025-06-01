import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import {header_image, jean} from '../../../../imgs';
import {Avatar} from 'react-native-paper';
import styles from './Styles';

const WhoWeAre = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Imagem de cabeçalho */}
      <Image
        source={header_image}
        style={styles.headerImage}
        resizeMode="cover"
      />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>QUEM SOMOS</Text>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Desde 2012</Text>
          <Text style={styles.paragraph}>
            Há mais de uma década, a Maskavo tem trilhado um percurso ousado e
            distinto no mercado da Moda Alternativa. Nossa jornada começou com
            uma visão clara: quebrar as barreiras do convencional e apresentar
            um vestuário que fosse mais do que simples roupas, mas sim uma forma
            de expressão poderosa.
          </Text>

          <Text style={styles.paragraph}>
            Nossa paixão pela moda vai além das tendências passageiras. Cada
            peça criada pela Maskavo é uma declaração de criatividade, coragem e
            autenticidade. Não nos limitamos ao padrão; desafiamos
            constantemente as convenções e exploramos novas fronteiras. Cada
            costura, cada detalhe é cuidadosamente pensado para transmitir nossa
            essência única.
          </Text>

          <Text style={styles.paragraph}>
            Ao longo desses anos, buscamos incessantemente a inovação. Somos
            movidos pela fome de experimentar, criar e surpreender. Cada coleção
            é uma jornada pela desconstrução do comum, explorando novas
            combinações de cores, texturas e formas. Acreditamos que a moda é
            uma forma de arte, e nossa missão é desafiar as expectativas
            tradicionais.
          </Text>
        </View>

        <View style={styles.highlightContainer}>
          <Text style={styles.highlightText}>
            Nossa paixão é a originalidade, versatilidade e conforto. Inovação é
            a nossa assinatura, e nossas peças são o resultado de uma busca
            incansável por designs que transcendem o ordinário.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>A Conexão com Nossos Clientes</Text>
          <Text style={styles.paragraph}>
            Nossa história não seria completa sem nossos clientes, que abraçaram
            nossa visão e se tornaram parte dela. Cada pessoa que veste uma peça
            da Maskavo é uma voz em nossa narrativa, uma testemunha do nosso
            compromisso em oferecer uma experiência de moda que vai além do
            material e se transforma em uma declaração de estilo pessoal.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Maskavo Hoje</Text>
          <Text style={styles.paragraph}>
            Atualmente, a Maskavo abrange todo o Brasil, trabalhando diariamente
            para transformar vidas para melhor. Somos pioneiros na exploração de
            novos modelos, tecidos e acabamentos, buscando sempre criar um
            impacto significativo em cada peça que produzimos.
          </Text>

          <Text style={styles.paragraph}>
            Nossa busca pela inovação continua a todo vapor. Cada coleção é o
            resultado de pesquisa, experimentação e dedicação. Trabalhamos
            incansavelmente para criar peças que vão além do estereótipo,
            desafiando as normas e inspirando a autoexpressão. A cada novo
            lançamento, buscamos superar nossos próprios limites, oferecendo aos
            nossos clientes roupas que são verdadeiramente únicas.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Adiante</Text>
          <Text style={styles.paragraph}>
            À medida que olhamos para o futuro, nosso compromisso com a
            originalidade e a autenticidade permanece inabalável. Continuaremos
            a explorar novos horizontes, desafiar as normas da moda convencional
            e criar roupas que ecoam a individualidade de quem as usa. A Maskavo
            é mais do que uma marca; é um movimento que celebra a coragem de
            sermos nós mesmos.
          </Text>
        </View>

        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            "Sem medo de ser feliz e não se calando mediante as injustiças,
            levantando pautas importantes e carregando no peito a Maskavo."
          </Text>
          <View style={styles.authorContainer}>
            <Avatar.Image size={100} source={jean} />
            <View style={styles.authorInfo}>
              <Text style={styles.quoteAuthor}>Jean Carlos Maciel</Text>
              <Text style={styles.quoteRole}>
                Estilista, fundador e proprietário
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default WhoWeAre;
