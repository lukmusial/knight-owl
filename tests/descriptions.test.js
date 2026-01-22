/**
 * Descriptions Module Tests
 */

TestRunner.suite('Descriptions Module', () => {
  TestRunner.test('monster room descriptions should not mention monsters', () => {
    // Create a mock monster room
    const monsterRoom = {
      type: 'monster',
      depth: 5,
      monster: {
        name: 'Goblin',
        namePL: 'Goblin',
        description: 'A sneaky goblin'
      }
    };

    // Generate description multiple times to test all templates
    const monsterKeywords = ['monster', 'creature', 'lurks', 'waiting', 'breathing', 'blocks your path'];

    for (let i = 0; i < 20; i++) {
      const desc = Descriptions.generateRoomDescription(monsterRoom);

      // Check English description doesn't contain monster references
      const descLower = desc.descriptionEN.toLowerCase();
      monsterKeywords.forEach(keyword => {
        TestRunner.assert(
          !descLower.includes(keyword),
          `Room description should not contain "${keyword}": ${desc.descriptionEN}`
        );
      });
    }
  });

  TestRunner.test('monster room descriptions should focus on environment', () => {
    const monsterRoom = {
      type: 'monster',
      depth: 5,
      monster: { name: 'Test Monster' }
    };

    // Environment keywords that should be present
    const envKeywords = ['chamber', 'room', 'stone', 'walls', 'floor', 'ceiling', 'door', 'air', 'light'];

    let foundEnvKeyword = false;
    for (let i = 0; i < 10; i++) {
      const desc = Descriptions.generateRoomDescription(monsterRoom);
      const descLower = desc.descriptionEN.toLowerCase();

      if (envKeywords.some(kw => descLower.includes(kw))) {
        foundEnvKeyword = true;
        break;
      }
    }

    TestRunner.assert(foundEnvKeyword, 'Room descriptions should contain environment-related words');
  });

  TestRunner.test('generateMonsterIntro should create monster introduction text', () => {
    const monster = {
      name: 'Stone Golem',
      namePL: 'Kamienny Golem',
      description: 'A hulking stone creature',
      descriptionPL: 'Potężne kamienne stworzenie'
    };

    const intro = Descriptions.generateMonsterIntro(monster);

    TestRunner.assertTruthy(intro.en, 'Should have English intro');
    TestRunner.assertTruthy(intro.pl, 'Should have Polish intro');
    TestRunner.assert(intro.en.includes('Stone Golem'), 'English intro should include monster name');
    TestRunner.assert(intro.pl.includes('Kamienny Golem'), 'Polish intro should include Polish monster name');
  });

  TestRunner.test('corridor descriptions should not mention monsters', () => {
    const corridorRoom = {
      type: 'corridor',
      depth: 3
    };

    for (let i = 0; i < 10; i++) {
      const desc = Descriptions.generateRoomDescription(corridorRoom);
      const descLower = desc.descriptionEN.toLowerCase();

      TestRunner.assert(
        !descLower.includes('monster'),
        'Corridor description should not mention monsters'
      );
    }
  });

  TestRunner.test('getRoomTitle should return bilingual titles', () => {
    const rooms = [
      { type: 'entrance', cleared: false },
      { type: 'corridor', cleared: false },
      { type: 'monster', cleared: false },
      { type: 'monster', cleared: true },
      { type: 'treasure', cleared: false },
      { type: 'boss', cleared: false }
    ];

    rooms.forEach(room => {
      const title = Descriptions.getRoomTitle(room);
      TestRunner.assertTruthy(title.en, `${room.type} room should have English title`);
      TestRunner.assertTruthy(title.pl, `${room.type} room should have Polish title`);
    });
  });

  TestRunner.test('generateNavigationOptions should include direction info', () => {
    // Mock connected rooms
    const connections = [
      { id: 'room_1', type: 'corridor', cleared: false },
      { id: 'room_2', type: 'monster', cleared: false }
    ];

    const options = Descriptions.generateNavigationOptions(connections, 'room_0');

    TestRunner.assertArray(options, 'Should return array of options');
    TestRunner.assertEqual(options.length, 2, 'Should have 2 navigation options');

    options.forEach(opt => {
      TestRunner.assertTruthy(opt.roomId, 'Option should have roomId');
      TestRunner.assertTruthy(opt.labelEN, 'Option should have English label');
      TestRunner.assertTruthy(opt.labelPL, 'Option should have Polish label');
      TestRunner.assertTruthy(opt.direction, 'Option should have direction');
      TestRunner.assertTruthy(opt.direction.en, 'Direction should have English name');
      TestRunner.assertTruthy(opt.direction.pl, 'Direction should have Polish name');
    });
  });

  TestRunner.test('getUILabels should return all required labels', () => {
    const labels = Descriptions.getUILabels();

    const requiredLabels = [
      'whereToGo', 'continue', 'correct', 'notQuiteRight', 'victory',
      'lootObtained', 'monstersDefeated', 'questions', 'treasure',
      'recentLoot', 'noItems', 'saveGame', 'playAgain', 'dragonChallenge', 'correctAnswer'
    ];

    requiredLabels.forEach(label => {
      TestRunner.assertTruthy(labels[label], `Should have ${label} label`);
      TestRunner.assertTruthy(labels[label].en, `${label} should have English text`);
      TestRunner.assertTruthy(labels[label].pl, `${label} should have Polish text`);
    });
  });
});
