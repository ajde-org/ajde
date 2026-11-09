# Localization wording review

New wording introduced while integrating AJDE-29 with the ride timing and security updates on `dev`. These rows record the current wording; none has human approval yet. Review the rendered screens as well as the wording. Changes to either language invalidate approval and require a new hash, as described in [I18N.md](I18N.md).

| Key | English | Macedonian | Review hash | Human review |
| --- | --- | --- | --- | --- |
| `timing.departureLabel` | Departure: {date}, Skopje time | Поаѓање: {date}, скопско време | cbb98b007cd4 | Pending |
| `timing.arrivalLabel` | Estimated arrival: {date}, Skopje time | Проценето пристигнување: {date}, скопско време | 404060772aff | Pending |
| `timing.arrival` | Estimated arrival | Проценето пристигнување | 1f4631d51766 | Pending |
| `timing.unavailable` | Unavailable | Недостапно | 3c04bed14987 | Pending |
| `timing.timeUnavailable` | Time unavailable | Времето е недостапно | 7535add98931 | Pending |
| `timing.features` | Ride features | Услови за патувањето | 5d9fbea23864 | Pending |
| `timing.noFeatures` | No special requests | Нема посебни барања | 06f981aed255 | Pending |
| `timing.noNotes` | The driver did not leave any notes | Возачот нема оставено белешки | afc086f25f7d | Pending |
| `timing.pickRide` | Pick ride | Избери превоз | 7ea34e7098a6 | Pending |
| `timing.pickRideLabel` | Pick ride from {origin} to {destination} | Избери превоз од {origin} до {destination} | 8f6faa97fe54 | Pending |
| `timing.duration` | Journey duration (minutes) | Времетраење на патувањето (минути) | a1779bccbef5 | Pending |
| `timing.durationUnavailable` | Arrival estimate unavailable until routing succeeds. | Проценетото пристигнување ќе биде достапно откако ќе се пресмета рутата. | 344957284a2f | Pending |
| `timing.durationHint` | Route estimate: {duration}. Add time for stops or delays; you cannot shorten it. | Проценето времетраење: {duration}. Додај време за паузи или доцнење; не можеш да го скратиш. | 18aef705656d | Pending |
| `timing.arrivalPreview` | Estimated arrival: {time} · Skopje time | Проценето пристигнување: {time} · скопско време | da785bd6da86 | Pending |
| `timing.arrivalPreviewDay` | Estimated arrival: {time} ({day}) · Skopje time | Проценето пристигнување: {time} ({day}) · скопско време | ac80d49f3d18 | Pending |
| `timing.calculating` | Estimating city-to-city driving time and distance… | Се проценуваат времето и растојанието за возење меѓу градовите… | 93fbc3e67583 | Pending |
| `timing.filled` | City-to-city driving time estimated. | Времето за возење меѓу градовите е проценето. | 85b39795de38 | Pending |
| `timing.failed` | Arrival estimate unavailable. Retry or publish without an estimate. | Проценетото пристигнување е недостапно. Обиди се повторно или објави без проценка. | ff72644867df | Pending |
| `timing.hours` | {count} h | {count} ч | f4cc5afb6f46 | Pending |
| `timing.minutes` | {count} min | {count} мин | 9461b9f402d4 | Pending |
| `validation.duration` | Duration must be at least the route estimate and no more than 24 hours. | Времетраењето мора да биде најмалку колку проценката за рутата и најмногу 24 часа. | 78f7dece23cc | Pending |
| `form.reviewDuration` | Review the journey duration. | Провери го времетраењето на патувањето. | 4f6d53738b1d | Pending |
| `form.durationNeedsEstimate` | Wait for a route estimate before adjusting duration. | Почекај ја проценката за рутата пред да го прилагодиш времетраењето. | 75a63b7e1fe2 | Pending |
| `form.profileRequired` | Complete your profile, including a phone number, before publishing a ride. | Дополни го профилот, вклучувајќи телефонски број, пред да објавиш превоз. | 8f0285e756ad | Pending |
| `form.profileCheckFailed` | We could not check your profile. Please try again. | Профилот не можеше да се провери. Обиди се повторно. | 56b240621d7a | Pending |
| `tripAction.departed` | This ride has already departed, so the booking can no longer be cancelled. | Превозот веќе појде, па резервацијата повеќе не може да се откаже. | 1a07a617d7bc | Pending |
| `driverProfile.backRide` | Back to ride | Назад кон превозот | f4b1b477a894 | Approved by user, 2026-11-09 |
| `driverProfile.editShort` | Edit profile | Уреди профил | 86daa3dd2f6a | Approved by user, 2026-11-09 |
| `driverProfile.memberSince` | Member since | Член од | a7be8cc7b24b | Approved by user, 2026-11-09 |
| `driverProfile.completed` | Completed rides | Завршени патувања | 7a86d1271d28 | Approved by user, 2026-11-09 |
| `driverProfile.unavailable` | Unavailable | Недостапно | 3c04bed14987 | Approved by user, 2026-11-09 |
| `driverProfile.noBioIntro` | Still getting to know this traveller? Their ride details are a good place to start. | Сакаш подобро да го запознаеш ова лице? Почни со деталите за неговите патувања. | 0ba1257031fd | Approved by user, 2026-11-09 |
| `driverProfile.preferences` | On the road with me | На пат со мене | f47aee0f5836 | Approved by user, 2026-11-09 |
| `driverProfile.preferencesLabel` | Travel preferences | Навики при патување | f5e298dd64fa | Approved by user, 2026-11-09 |
| `driverProfile.preferencesNote` | Personal preferences. Check each ride for its rules. | Лични навики. Провери ги правилата за секое патување. | 78d2e9ff7a17 | Approved by user, 2026-11-09 |
| `driverProfile.beyond` | Beyond the driver’s seat | Надвор од возачкото седиште | 13435c0f2198 | Approved by user, 2026-11-09 |
| `driverProfile.more` | A little more me | Уште малку за мене | a02cc9ae1c83 | Approved by user, 2026-11-09 |
| `driverProfile.conversation.chatty` | Always up for a good chat | Секогаш расположен за добар разговор | 4c799e76b597 | Approved by user, 2026-11-09 |
| `driverProfile.conversation.warm_up` | Chatty once I get comfortable | Сакам разговор откако ќе се опуштам | 9bdba0b25a45 | Approved by user, 2026-11-09 |
| `driverProfile.conversation.quiet` | Happy with a quiet ride | Ми одговара тивко патување | 4b0efe52d519 | Approved by user, 2026-11-09 |
| `driverProfile.music.playlist` | I come with a playlist | Доаѓам со подготвена плејлиста | ef24194f0421 | Approved by user, 2026-11-09 |
| `driverProfile.music.shared` | Everyone gets a turn on the aux | Секој може да избере музика | 74938af73114 | Approved by user, 2026-11-09 |
| `driverProfile.music.quiet` | I prefer music-free rides | Претпочитам патување без музика | 37df92907d21 | Approved by user, 2026-11-09 |
| `driverProfile.pets.welcome` | Happy to travel with pets | Со задоволство патувам со миленици | a7be3a8ee0d6 | Approved by user, 2026-11-09 |
| `driverProfile.pets.ask` | Ask me about pets first | Прашај ме прво за миленици | a7fdcc447ac2 | Approved by user, 2026-11-09 |
| `driverProfile.pets.no_pets` | I prefer travelling without pets | Претпочитам патување без миленици | 6e9bf88ac633 | Approved by user, 2026-11-09 |
| `driverProfile.smoking.no_smoking` | Smoke-free car, always | Во автомобилот никогаш не се пуши | e66245ef76d3 | Approved by user, 2026-11-09 |
| `driverProfile.smoking.stops` | Smoking at rest stops only | Пушење само на паузите | 1af4a4e28417 | Approved by user, 2026-11-09 |
| `driverProfile.prompt.superpower` | My road-trip superpower | Мојата супермоќ на патување | e0799b0d016a | Approved by user, 2026-11-09 |
| `driverProfile.prompt.playlist` | The song that always makes the playlist | Песната што секогаш е на плејлистата | b761b2064a85 | Approved by user, 2026-11-09 |
| `driverProfile.prompt.snack` | No road trip is complete without | Ниту едно патување не е целосно без | c55d8114f10b | Approved by user, 2026-11-09 |
| `driverProfile.prompt.detour` | A detour I would always take | Место за кое секогаш би скршнал од патот | 0950ee6e1a4c | Approved by user, 2026-11-09 |
| `driverProfile.prompt.passenger` | You bring the good company, I’ll bring | Ти донеси добро друштво, јас ќе донесам | 19127102d3c0 | Approved by user, 2026-11-09 |
| `driverProfile.prompt.unpopular_opinion` | My unpopular road-trip opinion | Моето непопуларно мислење за патувањата | 4660a27b13cd | Approved by user, 2026-11-09 |
| `driverProfile.editor.descriptorHelp` | Pick up to four descriptors. All optional, all visible on your profile. Each ride’s rules still apply. | Избери до четири навики. Сите се незадолжителни и видливи на твојот профил. Правилата за секое патување и понатаму важат. | 58d60da61867 | Approved by user, 2026-11-09 |
| `driverProfile.editor.conversation` | Conversation | Разговор | 1a9974c66585 | Approved by user, 2026-11-09 |
| `driverProfile.editor.music` | Music | Музика | 6ccf5c6d8ac4 | Approved by user, 2026-11-09 |
| `driverProfile.editor.pets` | Pets | Миленици | a28ee0b757ff | Approved by user, 2026-11-09 |
| `driverProfile.editor.smoking` | Smoking | Пушење | be373c4e4bc1 | Approved by user, 2026-11-09 |
| `driverProfile.editor.omit` | Leave off my profile | Не прикажувај на мојот профил | 5bc20242aeb4 | Approved by user, 2026-11-09 |
| `driverProfile.editor.moreYou` | A little more you | Уште малку за тебе | 40000675b982 | Approved by user, 2026-11-09 |
| `driverProfile.editor.promptHelp` | Answer up to three prompts. Give your next passenger something to break the ice. | Одговори на најмногу три прашања. Помогни му на следниот патник полесно да започне разговор. | 4565ffeddc96 | Approved by user, 2026-11-09 |
| `driverProfile.editor.promptNumber` | Prompt {number} | Прашање {number} | 3c613e3406b9 | Approved by user, 2026-11-09 |
| `driverProfile.editor.removePrompt` | Remove prompt {number} | Отстрани прашање {number} | ee3023c9fc1a | Approved by user, 2026-11-09 |
| `driverProfile.editor.remove` | Remove | Отстрани | 76c16e830a39 | Approved by user, 2026-11-09 |
| `driverProfile.editor.choose` | Choose a prompt | Избери прашање | 8aa435b1daa1 | Approved by user, 2026-11-09 |
| `driverProfile.editor.answer` | Your answer | Твојот одговор | 2692734d4ea0 | Approved by user, 2026-11-09 |
| `driverProfile.editor.placeholder` | A little personality goes a long way… | Покажи ни дел од твојот карактер… | 1c2aaf53ccd2 | Approved by user, 2026-11-09 |
| `driverProfile.editor.add` | + Add a prompt | + Додај прашање | 86b5c92ddeac | Approved by user, 2026-11-09 |
| `onboarding.social` | Social profile | Профил на друштвена мрежа | fc8cebd8096c | Approved by user, 2026-11-09 |
| `onboarding.bio` | Bio | Биографија | f95a0d6ed2b4 | Approved by user, 2026-11-09 |
| `onboarding.gender` | Gender | Пол | 94829103f2ff | Approved by user, 2026-11-09 |
