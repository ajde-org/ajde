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
